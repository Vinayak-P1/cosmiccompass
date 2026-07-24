import React, { useState } from "react";
import { Mail, Copy, Check, X, Sparkles, Headphones, ExternalLink } from "lucide-react";

const SupportModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = "support@urbanastro.space";

  if (!isOpen) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md bg-[#0C0E1A] border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-[#7C3AED]/20 text-center overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient circle inside modal */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full bg-white/[0.04] hover:bg-white/[0.1] transition-all cursor-pointer border border-white/[0.06]"
          aria-label="Close support modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#7C3AED]/30 via-[#7C3AED]/10 to-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center shadow-lg shadow-[#7C3AED]/20">
          <Headphones className="w-7 h-7 text-[#E8C470]" />
        </div>

        {/* Title & Description */}
        <h3 className="text-2xl font-bold text-white mb-2 font-hero-serif tracking-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Help & Support
        </h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          Have questions about your astrological consultation, bookings, or coupons? We’re here to guide you.
        </p>

        {/* Email Box Card */}
        <div className="bg-white/[0.03] border border-white/[0.1] hover:border-[#D4AF37]/40 rounded-xl p-4 mb-6 transition-all group relative">
          <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#E8C470]" />
            Official Support Email
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 bg-black/40 rounded-lg p-2.5 border border-white/[0.05]">
            {/* Direct Mailto Link */}
            <a
              href={`mailto:${email}`}
              className="text-[#E8C470] hover:text-white font-medium text-sm sm:text-base tracking-wide flex items-center gap-1.5 truncate hover:underline transition-colors"
              title="Click to send direct email"
            >
              <span>{email}</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/40 shrink-0" />
            </a>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                copied
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-white/[0.08] hover:bg-[#7C3AED]/40 text-white border border-white/[0.1]"
              }`}
              title="Copy email address"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Direct Email Action Button */}
        <a
          href={`mailto:${email}`}
          className="w-full inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-[#7C3AED]/30 hover:scale-[1.01] border border-[#D4AF37]/30"
        >
          <Mail className="w-4 h-4 text-[#E8C470]" />
          <span>Open Email Client</span>
        </a>
      </div>
    </div>
  );
};

export default SupportModal;
