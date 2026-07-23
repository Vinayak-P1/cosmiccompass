import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

const HeroSection = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    readingsDelivered: "10K+",
    verifiedExperts: "50+",
    userRating: "4.9",
    satisfaction: "98%",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/stats/public`);
        const data = await res.json();
        if (res.ok && data.success && data.stats) {
          setStatsData({
            readingsDelivered: data.stats.readingsDelivered || "10K+",
            verifiedExperts: data.stats.verifiedExperts || "50+",
            userRating: data.stats.userRating || "4.9",
            satisfaction: data.stats.satisfaction || "98%",
          });
        }
      } catch (err) {
        console.error("Fetch public stats error:", err);
      }
    })();
  }, []);

  const handleConsultationClick = () => {
    if (!user) {
      navigate("/login", { state: { from: "/consultation" } });
    } else {
      navigate("/consultation");
    }
  };

  const statsList = [
    { value: statsData.readingsDelivered, label: "Readings Delivered" },
    { value: statsData.verifiedExperts, label: "Verified Experts" },
    { value: statsData.userRating, label: "User Rating" },
    { value: statsData.satisfaction, label: "Satisfaction" },
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-24 overflow-hidden">
      {/* ── Glow Blobs ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-[#22D3EE]/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-[#7C3AED]/5 blur-[80px]" />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto animate-fade-up">
        {/* Section Label Pill */}
        <div className="ua-section-label mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
          <span className="text-xs font-semibold text-white/60 tracking-widest uppercase">
            Backed by ancient science. Built for 2026.
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Unlock Your{" "}
          <span className="text-[#7C3AED]">Future Clarity.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
          Expert guidance on career, love, job, health, money, marriage,
          relationship and education from veteran astrologers.
        </p>

        {/* Centered CTA Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleConsultationClick}
            className="ua-btn-primary text-base px-8 py-4 shadow-lg shadow-[#7C3AED]/25 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Reveal Your Celestial Path
          </button>
        </div>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-px mt-20 w-full max-w-3xl border border-white/[0.06] rounded-2xl overflow-hidden bg-white/[0.06] animate-fade-up animate-fade-up-d2">
        {statsList.map((s) => (
          <div key={s.label} className="bg-[#050816] px-6 py-5 text-center">
            <div
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {s.value}
            </div>
            <div className="text-xs text-white/40 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
