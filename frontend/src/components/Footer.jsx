import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Headphones, Mail, HelpCircle } from "lucide-react";
import SupportModal from "./SupportModal";

const Footer = () => {
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <footer className="border-t border-white/[0.06] mt-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                <span
                  className="text-white text-sm font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  U
                </span>
              </div>
              <span
                className="text-white font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                UrbanAstro
              </span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-6">
              The premium platform for personalized astrology — built for people
              who take both self-understanding and modern design seriously.
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/40 text-xs">
                All systems operational
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/astrologers"
                  className="text-white/40 hover:text-white text-sm transition-colors"
                >
                  Astrologers
                </Link>
              </li>
              <li>
                <Link
                  to="/askai"
                  className="text-white/40 hover:text-white text-sm transition-colors"
                >
                  Ask AI
                </Link>
              </li>
              <li>
                <Link
                  to="/my-bookings"
                  className="text-white/40 hover:text-white text-sm transition-colors"
                >
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support Column */}
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
              Help & Support
            </h4>
            <div className="bg-white/[0.02] border border-white/[0.08] hover:border-[#D4AF37]/30 rounded-2xl p-5 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-[#E8C470]" />
                </div>
                <div>
                  <h5 className="text-white text-sm font-semibold">Need Assistance?</h5>
                  <p className="text-white/40 text-xs">Our team is available 24/7</p>
                </div>
              </div>

              <button
                onClick={() => setIsSupportOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium text-xs transition-all shadow-md shadow-[#7C3AED]/20 cursor-pointer border border-[#D4AF37]/30"
              >
                <Mail className="w-3.5 h-3.5 text-[#E8C470]" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © 2026 UrbanAstro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSupportOpen(true)}
              className="text-white/40 hover:text-[#E8C470] text-xs transition-colors cursor-pointer"
            >
              Help & Support
            </button>
            <span className="text-white/20 text-xs">•</span>
            <p className="text-white/30 text-xs">
              Made with <span className="text-[#7C3AED]">♥</span> in Bengaluru.
            </p>
          </div>
        </div>
      </div>

      {/* Support Popup Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </footer>
  );
};

export default Footer;