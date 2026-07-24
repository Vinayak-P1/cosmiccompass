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
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-24">

      {/* ── Rotating Golden Celestial Zodiac Compass Wheel ────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] w-[420px] sm:w-[520px] md:w-[600px] aspect-square pointer-events-none z-0 opacity-[0.20] select-none">
        <img
          src="/zodiac_wheel.png"
          alt="Zodiac Compass Wheel"
          className="w-full h-full object-contain animate-spin-slow"
          style={{
            maskImage: "radial-gradient(circle, black 62%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle, black 62%, transparent 72%)",
          }}
        />
      </div>

      {/* ── Main Hero Content ────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto animate-fade-up">
        {/* Divine Celestial Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-[#D4AF37]/35 backdrop-blur-md mb-10 shadow-lg shadow-[#D4AF37]/5">
          <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          <span className="text-xs font-semibold tracking-wider text-[#E8C470] uppercase">
            Backed by Ancient Vedic Science • Built for 2026
          </span>
        </div>

        {/* Hero Headline */}
        <h1
          className="text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-bold text-white leading-[1.10] tracking-tight mb-8 font-hero-serif"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Unlock Your{" "}
          <span className="inline-block bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#E8C470] bg-clip-text text-transparent">
            Future Clarity.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-purple-200/70 max-w-2xl mx-auto leading-relaxed mb-10 font-light tracking-wide">
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
    </section>
  );
};

export default HeroSection;
