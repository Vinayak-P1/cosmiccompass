import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

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
  return (
    <div className="font-display min-h-screen flex items-center justify-center py-20 px-4 bg-[#030014] text-white relative overflow-hidden">
      {/* 🌌 Starfield Background */}
      <div className="absolute inset-0 bg-[radial-gradient(white,rgba(255,255,255,0.15)_1px,transparent_40px),radial-gradient(white,rgba(255,255,255,0.1)_1px,transparent_30px),radial-gradient(white,rgba(255,255,255,0.05)_2px,transparent_40px),radial-gradient(rgba(255,255,255,0.25),rgba(255,255,255,0.05)_2px,transparent_30px)] bg-[size:550px_550px,350px_350px,250px_250px,150px_150px] bg-[position:0_0,40px_60px,130px_270px,70px_100px] animate-stars" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b20]/40 via-[#0b0b20]/30 to-[#1b0033]/20 pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/10 dark:bg-black/30 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden z-10">
        <div className="p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-extrabold text-white drop-shadow-lg"
              style={{ fontFamily: "Inter,sans-serif" }}
            >
              Urban<span className="text-blue-400">Astro</span>
            </h1>
            <p className="text-white/70 mt-2">
              {step === 1 && "Login with your mobile number"}
              {step === 2 && "Enter the OTP sent to your phone"}
              {step === 3 && "Almost there! Tell us your name"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* ─── STEP 1: Phone Input ──────────────────────────────────────── */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleSendOtp}>
              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-lg px-4 h-12 text-white/70 font-bold text-lg select-none shrink-0">
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
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white text-lg tracking-wider placeholder-white/30 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>

              <p className="text-center text-white/40 text-xs mt-3">
                We'll send a 6-digit verification code to this number
              </p>
            </form>
          )}

          {/* ─── STEP 2: OTP Input ────────────────────────────────────────── */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              {/* Phone display with edit */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-white/60 text-sm">
                  OTP sent to{" "}
                  <span className="text-white font-bold">+91 {phone}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="text-blue-400 text-xs hover:underline"
                >
                  Change
                </button>
              </div>

              {/* OTP boxes */}
              <div className="flex justify-center gap-2 sm:gap-3">
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-black/30 border-2 border-white/15 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.some((d) => d === "")}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-white/40 text-sm">
                    Resend OTP in{" "}
                    <span className="text-blue-400 font-bold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-400 text-sm hover:underline"
                  >
                    Didn't receive OTP? Resend
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ─── STEP 3: Name Input (new users) ──────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm text-white/60 mb-2 block">
                  What should we call you?
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full bg-black/30 border border-white/10 rounded-lg h-12 px-4 text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <button
                onClick={handleSaveName}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 font-bold rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
              >
                {name ? `Continue as ${name}` : "Skip & Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
