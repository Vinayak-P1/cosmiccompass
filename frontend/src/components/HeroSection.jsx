import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Sparkles, ShieldCheck, Award, Star, Users } from "lucide-react";

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
    { value: statsData.readingsDelivered, label: "Readings Delivered", icon: Award },
    { value: statsData.verifiedExperts, label: "Verified Experts", icon: ShieldCheck },
    { value: statsData.userRating, label: "User Rating", icon: Star },
    { value: statsData.satisfaction, label: "Satisfaction Rate", icon: Users },
  ];

  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-24 overflow-hidden">
      {/* ── Ambient Radial Lighting Auras ───────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[#7C3AED]/18 blur-[130px]" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-[#D4AF37]/10 blur-[120px]" />
      </div>

      {/* ── Rotating Golden Celestial Zodiac Compass Wheel ───────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[500px] sm:w-[620px] md:w-[720px] aspect-square pointer-events-none z-0 opacity-[0.35] select-none">
        <img
          src="/zodiac_wheel.png"
          alt="Zodiac Compass Wheel"
          className="w-full h-full object-contain animate-spin-slow"
        />
      </div>

      {/* ── Main Hero Content ────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto animate-fade-up">
        {/* Divine Celestial Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-[#D4AF37]/35 backdrop-blur-md mb-8 shadow-lg shadow-[#D4AF37]/5">
          <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-[#E8C470] uppercase">
            Backed by Ancient Vedic Science • Built for 2026
          </span>
        </div>

        {/* Hero Headline */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-[1.02] tracking-tight mb-8 font-hero-serif"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Unlock Your{" "}
          <span className="bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#E8C470] bg-clip-text text-transparent">
            Future Clarity.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-12 font-light tracking-wide">
          Direct 1-on-1 guidance on career, love, health, wealth & marriage from verified veteran astrologers.
        </p>

        {/* Primary CTA Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleConsultationClick}
            className="group relative inline-flex items-center gap-3 px-9 py-4.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-base transition-all duration-300 shadow-xl shadow-[#7C3AED]/35 hover:shadow-[#D4AF37]/25 hover:scale-[1.02] cursor-pointer border border-[#D4AF37]/30"
          >
            <Sparkles className="w-5 h-5 text-[#E8C470] transition-transform group-hover:rotate-12" />
            <span>Reveal Your Celestial Path</span>
          </button>
        </div>
      </div>

      {/* ── Luxury Glass Stats Cards Grid ────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 w-full max-w-4xl animate-fade-up animate-fade-up-d2">
        {statsList.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 text-center shadow-lg shadow-black/40 hover:-translate-y-1"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 mb-3 text-[#E8C470] group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div
                className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-white/60 mt-1">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HeroSection;
