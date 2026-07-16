import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";

const SelectPlan = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [featuredCoupon, setFeaturedCoupon] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, couponRes] = await Promise.all([
          fetch(`${API}/api/pricing/plans`),
          fetch(`${API}/api/coupons/featured`),
        ]);
        const plansData = await plansRes.json();
        const couponData = await couponRes.json();

        if (plansData.ok && plansData.plans.length > 0) {
          setPlans(plansData.plans);
          // Auto-select the plan with badge, or the last one (premium), or first
          const badgePlan = plansData.plans.find((p) => p.badge);
          setSelected(badgePlan ? badgePlan._id : plansData.plans[plansData.plans.length - 1]._id);
        }

        if (couponData.ok && couponData.coupon) {
          setFeaturedCoupon(couponData.coupon);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyCoupon = () => {
    if (!featuredCoupon) return;
    navigator.clipboard.writeText(featuredCoupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleProceed = () => {
    if (!selected) {
      alert("Please select a plan to continue.");
      return;
    }

    const selectedPlan = plans.find((p) => p._id === selected);
    const consultationData = JSON.parse(
      localStorage.getItem("consultationData") || "{}"
    );

    consultationData.plan = selectedPlan.slug || selectedPlan._id;
    consultationData.planName = selectedPlan.name;
    consultationData.planOriginalPrice = selectedPlan.originalPrice;
    consultationData.planPrice = selectedPlan.price;

    // Detect questionCount with regex fallback from features text if missing
    let detectedQCount = selectedPlan.questionCount;
    if (!detectedQCount && selectedPlan.features) {
      for (const f of selectedPlan.features) {
        const match = f.match(/(\d+)\s*(question|q|query|queries)/i);
        if (match) {
          detectedQCount = Number(match[1]);
          break;
        }
      }
    }
    consultationData.planQuestionCount = detectedQCount || 2;

    localStorage.setItem("consultationData", JSON.stringify(consultationData));
    navigate("/select-life-area");
  };

  // Color mapping for gradients — we use inline styles for dynamic colors
  const getGradient = (from, to) => {
    const colorMap = {
      "blue-600": "#2563eb", "indigo-600": "#4f46e5",
      "purple-600": "#9333ea", "pink-600": "#db2777",
      "emerald-600": "#059669", "teal-600": "#0d9488",
      "amber-500": "#f59e0b", "orange-500": "#f97316",
      "rose-500": "#f43f5e", "red-600": "#dc2626",
      "cyan-500": "#06b6d4",
    };
    return `linear-gradient(135deg, ${colorMap[from] || "#2563eb"}, ${colorMap[to] || "#4f46e5"})`;
  };

  const getBorderColor = (from) => {
    const map = {
      "blue-600": "rgba(59,130,246,0.5)", "purple-600": "rgba(147,51,234,0.5)",
      "emerald-600": "rgba(5,150,105,0.5)", "amber-500": "rgba(245,158,11,0.5)",
      "rose-500": "rgba(244,63,94,0.5)", "cyan-500": "rgba(6,182,212,0.5)",
    };
    return map[from] || "rgba(59,130,246,0.5)";
  };

  const getGlowColor = (from) => {
    const map = {
      "blue-600": "0 0 25px rgba(59,130,246,0.2)", "purple-600": "0 0 25px rgba(147,51,234,0.3)",
      "emerald-600": "0 0 25px rgba(5,150,105,0.2)", "amber-500": "0 0 25px rgba(245,158,11,0.2)",
      "rose-500": "0 0 25px rgba(244,63,94,0.2)", "cyan-500": "0 0 25px rgba(6,182,212,0.2)",
    };
    return map[from] || "0 0 25px rgba(59,130,246,0.2)";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center text-white">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">sell</span>
          <p className="text-gray-400 text-lg">No plans available right now. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#030014] font-display text-gray-200">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col flex-grow items-center justify-start pt-20 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Step progress */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-400">Step 2 of 5</p>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>

          {/* Title */}
          <header className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Choose Your Plan
            </h1>
            <p className="text-gray-400 mt-2">
              Select the consultation that's right for you
            </p>
          </header>

          {/* Coupon Banner — only shows if there's a featured coupon */}
          {featuredCoupon && (
            <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-xl">
                    local_offer
                  </span>
                  <div>
                    <p className="text-amber-300 font-bold text-sm">
                      🎉 ₹{featuredCoupon.value} OFF — Only for first{" "}
                      {featuredCoupon.remainingUses >= 999999
                        ? "limited"
                        : featuredCoupon.remainingUses}{" "}
                      users!
                    </p>
                    <p className="text-amber-400/70 text-xs mt-0.5">
                      Use this coupon at checkout
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopyCoupon}
                  className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-4 py-2 rounded-lg transition-all duration-300"
                >
                  <span className="font-mono font-bold text-amber-300 tracking-wider text-sm">
                    {featuredCoupon.code}
                  </span>
                  <span className="material-symbols-outlined text-amber-400 text-base">
                    {copied ? "check" : "content_copy"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className={`grid grid-cols-1 ${plans.length > 1 ? "sm:grid-cols-2" : ""} gap-4`}>
            {plans.map((plan) => {
              const isSelected = selected === plan._id;
              return (
                <div
                  key={plan._id}
                  onClick={() => setSelected(plan._id)}
                  className="relative cursor-pointer rounded-2xl p-5 transition-all duration-300 border-2 backdrop-blur-sm"
                  style={{
                    borderColor: isSelected
                      ? getBorderColor(plan.colorFrom)
                      : "rgba(255,255,255,0.1)",
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.05)",
                    boxShadow: isSelected ? getGlowColor(plan.colorFrom) : "none",
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Selection indicator */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "border-blue-400 bg-blue-500"
                          : "border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-white text-sm">
                          check
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-4 mt-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: getGradient(plan.colorFrom, plan.colorTo) }}
                    >
                      <span className="material-symbols-outlined text-white text-xl">
                        {plan.icon}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-500 line-through text-lg">
                        ₹{plan.originalPrice}
                      </span>
                      <span className="text-3xl font-extrabold text-white">
                        ₹{plan.price}
                      </span>
                    </div>
                    {featuredCoupon && (
                      <div className="mt-1">
                        <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          ₹{featuredCoupon.value} OFF with {featuredCoupon.code}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-400 text-base mt-0.5">
                          check_circle
                        </span>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Proceed button */}
          <div className="mt-8">
            <button
              onClick={handleProceed}
              disabled={!selected}
              className={`w-full h-14 font-bold rounded-xl relative overflow-hidden group transition-all duration-300 text-lg ${
                selected
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02]"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue with{" "}
              {selected
                ? plans.find((p) => p._id === selected)?.name
                : "..."}{" "}
              Plan
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">lock</span>
              Secure Payment
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                schedule
              </span>
              24hr Delivery
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                verified
              </span>
              Expert Astrologers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPlan;
