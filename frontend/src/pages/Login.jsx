import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Phone, KeyRound, User, ArrowLeft, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/";
  const { login } = useContext(AuthContext);

  // Flow state
  const [step, setStep] = useState(1); // 1 = phone, 2 = otp, 3 = name (new user)
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const otpRefs = useRef([]);
  const phoneRef = useRef(null);

  // Dynamic SEO meta updates
  useEffect(() => {
    const title = "Secure Login / Signup | UrbanAstro";
    const desc = "Log in or sign up securely on UrbanAstro using your mobile number. Access your personalized astrology consultations, bookings, and reports.";
    const url = "https://urbanastro.space/login";

    document.title = title;

    const setMeta = (propertyOrName, content, attr = "property") => {
      const el = document.querySelector(`meta[${attr}="${propertyOrName}"]`);
      if (el) el.setAttribute("content", content);
    };

    setMeta("description", desc, "name");
    setMeta("og:title", title);
    setMeta("og:description", desc);
    setMeta("og:url", url);
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("twitter:url", url);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
  }, []);

  // Focus phone input on mount
  useEffect(() => {
    if (step === 1 && phoneRef.current) phoneRef.current.focus();
  }, [step]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first OTP box when step changes to 2
  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ─── Send OTP ───────────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number starting with 6-9");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
      } else if (res.status === 429 && data.retryAfter) {
        setCountdown(data.retryAfter);
        setError(data.error);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle OTP input ──────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      handleVerifyOtp(null, newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtp(digits);
      otpRefs.current[5]?.focus();
      // Auto-submit
      setTimeout(() => handleVerifyOtp(null, pasted), 200);
    }
  };

  // ─── Verify OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e, otpString) => {
    if (e) e.preventDefault();
    setError("");

    const otpCode = otpString || otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${phone}`,
          otp: otpCode,
          name: name || "",
        }),
      });
      const data = await res.json();

      if (res.ok && data.user && data.token) {
        if (data.isNewUser && !data.user.name) {
          // New user — ask for name
          setIsNewUser(true);
          setStep(3);
          // Store partial auth data temporarily
          window.__tempAuth = { user: data.user, token: data.token };
        } else {
          login(data.user, data.token);
          if (data.user.isAdmin) {
            navigate("/admin/dashboard");
          } else {
            navigate(redirectPath, { replace: true });
          }
        }
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Save name (new user) ──────────────────────────────────────────────────
  const handleSaveName = async () => {
    const auth = window.__tempAuth;
    if (!auth) return;

    const trimmedName = name.trim() || "User";
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const userData = { ...auth.user, name: trimmedName };
        login(userData, auth.token);
        delete window.__tempAuth;

        if (userData.isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate(redirectPath, { replace: true });
        }
      } else {
        setError(data.error || "Failed to save name");
      }
    } catch (err) {
      console.error("Save name error:", err);
      setError("Network error saving name. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = () => {
    if (countdown > 0) return;
    handleSendOtp();
  };

  // ─── Step icons for the progress indicator ─────────────────────────────────
  const stepIcons = [
    { icon: Phone, label: "Phone" },
    { icon: KeyRound, label: "Verify" },
    { icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden font-display">
      {/* ── Glow Blobs ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/8 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-[#22D3EE]/5 blur-[100px]" />
      </div>

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md mx-auto ua-card overflow-hidden animate-fade-up">
        <div className="p-5 sm:p-8 w-full">
          {/* ── Step Progress ─────────────────────────────────────────── */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-8 w-full">
            {stepIcons.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = step === i + 1;
              const isDone = step > i + 1;
              return (
                <React.Fragment key={s.label}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-[#7C3AED] shadow-lg shadow-[#7C3AED]/30"
                          : isDone
                          ? "bg-[#7C3AED]/20"
                          : "bg-white/[0.06] border border-white/[0.08]"
                      }`}
                    >
                      <StepIcon
                        className={`w-4 h-4 ${
                          isActive
                            ? "text-white"
                            : isDone
                            ? "text-[#7C3AED]"
                            : "text-white/30"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        isActive
                          ? "text-white"
                          : isDone
                          ? "text-[#7C3AED]"
                          : "text-white/30"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < stepIcons.length - 1 && (
                    <div
                      className={`flex-1 max-w-[32px] sm:max-w-[48px] h-px mt-[-16px] transition-all duration-300 ${
                        step > i + 1 ? "bg-[#7C3AED]/50" : "bg-white/[0.1]"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Logo + Subtitle ───────────────────────────────────────── */}
          <div className="text-center mb-6 w-full">
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Urban<span className="text-[#7C3AED]">Astro</span>
            </h1>
            <p className="text-white/50 mt-1.5 text-xs sm:text-sm">
              {step === 1 && "Login with your mobile number"}
              {step === 2 && "Enter the OTP sent to your phone"}
              {step === 3 && "Almost there! Tell us your name"}
            </p>
          </div>

          {/* ── Error message ─────────────────────────────────────────── */}
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          {/* ═══ STEP 1: Phone Input ═══════════════════════════════════ */}
          {step === 1 && (
            <form className="space-y-4 w-full" onSubmit={handleSendOtp}>
              <div className="w-full">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block text-left">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 h-12 text-white/70 font-bold text-base select-none shrink-0">
                    +91
                  </div>
                  <input
                    ref={phoneRef}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(val);
                      setError("");
                    }}
                    className="flex-1 w-full min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-xl h-12 px-4 text-white text-base sm:text-lg tracking-wider placeholder-white/25 focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C3AED]/25 border-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>

              <p className="text-center text-white/30 text-[11px] sm:text-xs mt-2">
                We'll send a 6-digit verification code to this number
              </p>
            </form>
          )}

          {/* ═══ STEP 2: OTP Input ═════════════════════════════════════ */}
          {step === 2 && (
            <form className="space-y-4 w-full" onSubmit={handleVerifyOtp}>
              {/* Phone display with edit */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-white/50 text-xs sm:text-sm">
                  OTP sent to{" "}
                  <span className="text-white font-semibold">+91 {phone}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-[#7C3AED] text-xs hover:text-[#a78bfa] transition-colors flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Change
                </button>
              </div>

              {/* OTP boxes grid for 100% mobile fit */}
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5 w-full my-4">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className="w-full h-12 sm:h-14 text-center text-lg sm:text-2xl font-bold bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.some((d) => d === "")}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C3AED]/25 border-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-white/40 text-xs sm:text-sm">
                    Resend OTP in{" "}
                    <span className="text-[#7C3AED] font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#7C3AED] text-xs sm:text-sm hover:text-[#a78bfa] transition-colors font-semibold"
                  >
                    Didn't receive OTP? Resend
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ═══ STEP 3: Name Input (new users) ════════════════════════ */}
          {step === 3 && (
            <div className="space-y-4 w-full">
              <div className="w-full">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block text-left">
                  What should we call you?
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl h-12 px-4 text-white placeholder-white/25 focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-all text-base"
                />
              </div>

              <button
                onClick={handleSaveName}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#7C3AED]/25 border-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : name ? (
                  `Continue as ${name}`
                ) : (
                  "Skip & Continue"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
