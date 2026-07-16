import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import qrImg from "../assets/GooglePay_QR.png";

const API = import.meta.env.VITE_API_URL || "";
const UPI_ID = import.meta.env.VITE_UPI_ID || "urbanastro@paytm";

const Payment = () => {
  const navigate = useNavigate();

  // Selected Plan Info from localStorage
  const [planName, setPlanName] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  
  // Pricing states
  const [baseAmount, setBaseAmount] = useState(0); // Selected plan's originalPrice
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  
  // Coupon states
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [featuredCoupon, setFeaturedCoupon] = useState(null);

  // UTR & Screenshot Verification Section Visibility Toggle
  const [showVerification, setShowVerification] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Verification form states
  const [utrValue, setUtrValue] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const consultationData = JSON.parse(localStorage.getItem("consultationData") || "{}");

  // Load plan details from localStorage & fetch featured coupon
  useEffect(() => {
    if (!consultationData?.question) {
      alert("Missing consultation details. Please start again.");
      navigate("/consultation");
      return;
    }

    const planOriginal = Number(consultationData.planOriginalPrice || 299);
    const planNameStr = consultationData.planName || "Starter";
    const slugStr = consultationData.plan || "starter";

    setPlanName(planNameStr);
    setPlanSlug(slugStr);
    setBaseAmount(planOriginal);
    setFinalAmount(planOriginal);

    // Fetch featured coupon from backend
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API}/api/coupons/featured`);
        const data = await res.json();
        if (data.ok && data.coupon) {
          setFeaturedCoupon(data.coupon);
          setCouponCodeInput(data.coupon.code); // Prefill coupon input
        }
      } catch (err) {
        console.error("Fetch featured coupon error:", err);
      }
    };
    fetchFeatured();
  }, []);

  // Recalculate coupon when baseAmount or coupon changes
  const applyCoupon = async (codeToApply = couponCodeInput) => {
    const code = String(codeToApply || "").trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponError("");
    setCouponSuccess("");

    // Custom local coupon validation
    if (code === "RAJU50") {
      setDiscount(50);
      setFinalAmount(Math.max(0, baseAmount - 50));
      setAppliedCoupon("RAJU50");
      setCouponSuccess("Coupon 'RAJU50' applied successfully! ₹50 OFF");
      return;
    }

    try {
      const res = await fetch(`${API}/api/coupons/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!data.ok) {
        setCouponError(data.reason === "invalid_or_inactive" ? "Coupon code is invalid or expired" : "Invalid coupon code");
        setDiscount(0);
        setFinalAmount(baseAmount);
        setAppliedCoupon("");
        return;
      }

      let disc = 0;
      if (data.coupon.type === "percent") {
        disc = Math.round((baseAmount * data.coupon.value) / 100);
      } else {
        disc = data.coupon.value || 0;
      }

      setDiscount(disc);
      setFinalAmount(Math.max(0, baseAmount - disc));
      setAppliedCoupon(code);
      setCouponSuccess(`Coupon '${code}' applied! ₹${disc} discount.`);
    } catch (err) {
      setCouponError("Failed to validate coupon. Try again.");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setFinalAmount(baseAmount);
    setAppliedCoupon("");
    setCouponSuccess("");
    setCouponError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // Submit manual verification details
  const handleVerifyPayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    if (!utrValue.trim() || utrValue.trim().length < 6) {
      alert("Please enter a valid Transaction ID / UTR number (at least 6 digits)");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", consultationData.name || "");
      formData.append("email", consultationData.email || "");
      formData.append("birthDate", consultationData.birthDate || "");
      formData.append("birthTime", consultationData.birthTime || "");
      formData.append("birthLocation", consultationData.birthLocation || "");
      formData.append("unknownTime", consultationData.unknownTime || false);
      formData.append("question", consultationData.question || "");
      formData.append("couponCode", appliedCoupon || "");
      formData.append("utr", utrValue.trim());
      formData.append("plan", planSlug);
      if (consultationData.refSource) {
        formData.append("refSource", consultationData.refSource);
      }
      if (consultationData.selectedLifeAreas) {
        formData.append("selectedLifeAreas", JSON.stringify(consultationData.selectedLifeAreas));
      }
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      const res = await fetch(`${API}/api/bookings/manual`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification submission failed");
      
      alert("Payment details submitted successfully! The admin will verify your payment details and screenshot to approve your report shortly.");
      navigate("/my-bookings");
    } catch (err) {
      console.error("Submit verification error:", err);
      alert(err.message || "Submission failed. Please check details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const upiIntentLink = `upi://pay?pa=${UPI_ID}&pn=UrbanAstro&am=${finalAmount}&cu=INR`;

  return (
    <div className="min-h-screen bg-[#030014] text-white pt-24 md:pt-28 pb-12 relative overflow-hidden">
      {/* Background Starfield effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-transparent to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-lg mx-auto px-4">
        {/* Step Progress */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">Step 5 of 5</p>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6">
          <h1 className="text-2xl font-bold text-center mb-1 text-white">Checkout & Pay</h1>
          <p className="text-center text-gray-400 text-sm mb-6">{planName} Plan selected</p>

          <div className="space-y-6">
            {/* Promo Code Input & Logic */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Have a Promo Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. RAJU50, URBAN200"
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-black/30 border border-white/15 rounded-lg px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm h-11"
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2.5 rounded-lg text-sm font-bold border border-red-500/30 transition-all whitespace-nowrap"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => applyCoupon()}
                    className="bg-blue-500 hover:bg-blue-600 px-5 py-2.5 rounded-lg text-sm font-bold transition-all"
                  >
                    Apply
                  </button>
                )}
              </div>
              {/* Promo validation feedback alerts */}
              {couponError && <p className="text-xs text-red-400 mt-1.5 font-medium">❌ {couponError}</p>}
              {couponSuccess && <p className="text-xs text-green-400 mt-1.5 font-medium">✅ {couponSuccess}</p>}

              {/* Quick Featured Coupon Selector Chip */}
              {featuredCoupon && !appliedCoupon && (
                <button
                  onClick={() => applyCoupon(featuredCoupon.code)}
                  className="mt-3 flex items-center justify-between w-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-xs px-3.5 py-2.5 rounded-lg transition-all"
                >
                  <span className="font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">redeem</span>
                    🎁 Apply featured coupon {featuredCoupon.code} to save ₹{featuredCoupon.value}
                  </span>
                  <span className="underline font-bold">Apply</span>
                </button>
              )}
            </div>

            {/* Price Overview Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>Selected Plan: <strong className="text-white font-medium">{planName}</strong></span>
                <span className="font-semibold text-white">₹{baseAmount}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-400">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-white/10 pt-2.5 text-base sm:text-lg">
                <span className="font-semibold">Total Payable</span>
                <span className="font-extrabold text-blue-400">₹{finalAmount}</span>
              </div>
            </div>

            {/* Direct UPI Intent Link / Pay Button */}
            <div className="space-y-3.5">
              <a
                href={upiIntentLink}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-extrabold rounded-xl text-lg shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] text-center animate-pulse"
              >
                <span className="material-symbols-outlined">smartphone</span>
                Pay ₹{finalAmount} via UPI App
              </a>
              <p className="text-[11px] sm:text-xs text-center text-gray-400">
                📱 Recommended for mobile users (Opens GPay, PhonePe, Paytm, BHIM directly).
              </p>
            </div>

            {/* QR Payment toggle button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="w-full py-3 bg-white/5 border border-white/15 hover:bg-white/10 text-gray-200 hover:text-white font-bold rounded-xl text-sm transition-all text-center flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">qr_code_2</span>
                {showQR ? "Hide QR Code" : "Pay via QR (Preferred for desktop/laptop users)"}
              </button>
              
              {showQR && (
                <div className="flex flex-col items-center justify-center p-5 border border-white/10 bg-black/20 rounded-xl transition-all duration-300">
                  <p className="text-xs font-semibold text-gray-400 mb-3">Scan with any UPI App on your phone</p>
                  <img src={qrImg} alt="UPI Payment QR" className="w-44 h-44 object-contain rounded-lg border border-white/10 bg-white p-2 shadow-lg" />
                  <p className="text-sm font-bold text-white mt-3">Pay ₹{finalAmount}</p>
                </div>
              )}
            </div>

            {/* I've Paid action button to show verification details */}
            {!showVerification && (
              <div className="border-t border-white/10 pt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowVerification(true)}
                  className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-500/40 text-blue-400 hover:text-blue-300 font-bold rounded-xl text-sm transition-all"
                >
                  👉 Click here after paying (I've Paid)
                </button>
              </div>
            )}

            {/* UTR & Screenshot Verification Form (Appears when user clicks "I've Paid") */}
            {showVerification && (
              <form onSubmit={handleVerifyPayment} className="border-t border-white/10 pt-5 space-y-4 transition-all duration-500">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400">verified_user</span>
                  Verify Payment (After Paying)
                </h3>
                
                {/* UTR Input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    12-Digit Transaction ID / UTR Number *
                  </label>
                  <input
                    type="text"
                    value={utrValue}
                    onChange={(e) => setUtrValue(e.target.value.replace(/[^0-9]/g, "").substring(0, 12))}
                    placeholder="Enter 12-digit payment reference number"
                    required
                    className="w-full h-11 px-4 bg-black/30 border border-white/15 rounded-lg text-white font-mono placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>

                {/* Payment Screenshot File Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Upload Payment Screenshot *
                  </label>
                  <div className="flex flex-col items-center justify-center bg-black/30 border border-dashed border-white/20 rounded-lg p-4 transition hover:border-white/40 relative">
                    {screenshotPreview ? (
                      <div className="w-full flex items-center gap-3">
                        <img src={screenshotPreview} alt="Screenshot Preview" className="w-12 h-12 rounded object-cover border border-white/25" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{screenshotFile?.name}</p>
                          <p className="text-[10px] text-gray-500">{(screenshotFile?.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                          className="text-xs text-red-400 underline font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined text-gray-400 text-2xl mb-1">image</span>
                        <span className="text-xs font-semibold text-gray-300">Choose Screenshot Image</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">JPEG, PNG, or WebP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Details Verification */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting Proof...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">cloud_upload</span>
                      Submit Verification Details
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
