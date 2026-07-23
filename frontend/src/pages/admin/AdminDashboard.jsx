import React from "react";
import { Link } from "react-router-dom";
import { Users, Tag, DollarSign, FileText, BarChart3 } from "lucide-react";

const AdminCard = ({ to, title, description, icon: Icon }) => (
  <Link
    to={to}
    className="ua-card ua-card-hover p-6 flex flex-col justify-between group no-underline transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#7C3AED]" />
      </div>
      <span className="text-xs font-semibold text-[#22D3EE] uppercase tracking-wider bg-[#7C3AED]/10 px-2.5 py-1 rounded-full border border-[#7C3AED]/20">
        Manage
      </span>
    </div>
    <div>
      <h3
        className="text-xl font-bold text-white mb-1 group-hover:text-[#22D3EE] transition-colors"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h3>
      <p className="text-sm text-white/40">{description}</p>
    </div>
  </Link>
);

const AdminDashboard = () => {
  return (
    <div className="min-h-screen font-display text-white pt-24 md:pt-28 lg:pt-32 px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
      {/* ── Glow Blobs ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#7C3AED]/8 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <div className="ua-section-label mb-3">
            <span className="dot" />
            <span className="text">Control Panel</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Admin <span className="text-[#7C3AED]">Dashboard</span>
          </h1>
          <p className="text-white/50 text-base max-w-xl">
            Manage astrologers, coupons, pricing plans, site stats, and user consultation reports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
          <AdminCard
            to="/admin/astrologers"
            title="Astrologers"
            description="Add, edit or remove expert profiles"
            icon={Users}
          />
          <AdminCard
            to="/admin/coupons"
            title="Coupons"
            description="Create promo codes & feature deals"
            icon={Tag}
          />
          <AdminCard
            to="/admin/pricing"
            title="Pricing Plans"
            description="Configure plan tiers & pricing"
            icon={DollarSign}
          />
          <AdminCard
            to="/admin/bookings"
            title="User Reports"
            description="Approve payments & upload PDFs"
            icon={FileText}
          />
          <AdminCard
            to="/admin/stats"
            title="Stats & Ratings"
            description="Manage homepage numbers & view user reviews"
            icon={BarChart3}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
