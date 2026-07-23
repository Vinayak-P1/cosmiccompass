import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Star, TrendingUp, Users, CheckCircle, Sparkles, RefreshCw } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

const formatStatPreview = (val) => {
  const num = Number(val || 0);
  if (num >= 1000) {
    const inK = (num / 1000).toFixed(1);
    return `${inK.endsWith(".0") ? Math.floor(num / 1000) : inK}K+`;
  }
  return `${num}+`;
};

const ManageStats = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [readingsBase, setReadingsBase] = useState(10000);
  const [verifiedExpertsBase, setVerifiedExpertsBase] = useState(50);
  const [userRatingOverride, setUserRatingOverride] = useState("");
  const [satisfactionOverride, setSatisfactionOverride] = useState("");

  const [liveData, setLiveData] = useState({
    completedBookingsCount: 0,
    astrologersCount: 0,
    ratingsCount: 0,
    ratings: [],
  });

  const fetchStatsSettings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API}/api/stats/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.settings || {};
        setReadingsBase(s.readingsBase ?? 10000);
        setVerifiedExpertsBase(s.verifiedExpertsBase ?? 50);
        setUserRatingOverride(s.userRatingOverride ?? "");
        setSatisfactionOverride(s.satisfactionOverride ?? "");
        if (data.liveData) setLiveData(data.liveData);
      } else {
        setError(data.error || "Failed to load stats settings");
      }
    } catch (e) {
      console.error("Fetch stats error:", e);
      setError("Network error loading stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const res = await fetch(`${API}/api/stats/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          readingsBase: Number(readingsBase),
          verifiedExpertsBase: Number(verifiedExpertsBase),
          userRatingOverride: userRatingOverride === "" ? null : Number(userRatingOverride),
          satisfactionOverride: satisfactionOverride === "" ? null : Number(satisfactionOverride),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Stats settings updated successfully! Check Home Page now.");
        fetchStatsSettings();
      } else {
        setError(data.error || "Failed to update stats settings");
      }
    } catch (e) {
      console.error("Update stats error:", e);
      setError("Network error updating stats");
    } finally {
      setSaving(false);
    }
  };

  const totalReadingsCalculated = Number(readingsBase || 0) + liveData.completedBookingsCount;
  const totalExpertsCalculated = Number(verifiedExpertsBase || 0) + liveData.astrologersCount;

  return (
    <div className="min-h-screen font-display text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors no-underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-extrabold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Site <span className="text-[#7C3AED]">Stats & Ratings</span> Management
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Manage live numbers, base offsets, manual overrides & view user ratings.
          </p>
        </div>

        <button
          onClick={fetchStatsSettings}
          className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Refresh stats"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 animate-fade-up">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-up">
          {error}
        </div>
      )}

      {/* Live System Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="ua-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-white/40 font-medium">Completed Reports in DB</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {liveData.completedBookingsCount}
            </div>
            <div className="text-[11px] text-purple-400 mt-0.5">
              +1 auto added on report upload
            </div>
          </div>
        </div>

        <div className="ua-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs text-white/40 font-medium">Astrologers in DB</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {liveData.astrologersCount}
            </div>
            <div className="text-[11px] text-cyan-400 mt-0.5">
              +1 auto added on astrologer create
            </div>
          </div>
        </div>

        <div className="ua-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-xs text-white/40 font-medium">User Ratings Received</div>
            <div className="text-2xl font-bold text-white mt-0.5">
              {liveData.ratingsCount}
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">
              Auto calculates avg & satisfaction
            </div>
          </div>
        </div>
      </div>

      {/* Live Homepage Preview Bar */}
      <div className="ua-card p-5 mb-8 border border-[#7C3AED]/30 bg-[#7C3AED]/5">
        <div className="text-xs font-bold text-[#22D3EE] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#7C3AED]" />
          Live Homepage Display Preview
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-[#050816] p-3 rounded-xl border border-white/[0.06]">
            <div className="text-xl font-bold text-white">{formatStatPreview(totalReadingsCalculated)}</div>
            <div className="text-[11px] text-white/40">Readings Delivered</div>
          </div>
          <div className="bg-[#050816] p-3 rounded-xl border border-white/[0.06]">
            <div className="text-xl font-bold text-white">{formatStatPreview(totalExpertsCalculated)}</div>
            <div className="text-[11px] text-white/40">Verified Experts</div>
          </div>
          <div className="bg-[#050816] p-3 rounded-xl border border-white/[0.06]">
            <div className="text-xl font-bold text-white">{userRatingOverride || "4.9"}</div>
            <div className="text-[11px] text-white/40">User Rating</div>
          </div>
          <div className="bg-[#050816] p-3 rounded-xl border border-white/[0.06]">
            <div className="text-xl font-bold text-white">{satisfactionOverride ? `${satisfactionOverride}%` : "98%"}</div>
            <div className="text-[11px] text-white/40">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Admin Settings Form */}
      <form onSubmit={handleSave} className="ua-card p-6 mb-10 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/[0.08] pb-4">
          <Sparkles className="w-5 h-5 text-[#7C3AED]" />
          Configure Homepage Base Numbers & Overrides
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Readings Base Offset */}
          <div>
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-2">
              Readings Delivered Base Offset (e.g. 10000)
            </label>
            <input
              type="number"
              value={readingsBase}
              onChange={(e) => setReadingsBase(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 h-11 text-white text-base focus:border-[#7C3AED]/50 outline-none"
            />
            <p className="text-[11px] text-white/40 mt-1.5">
              Will show on Homepage: <span className="text-purple-400 font-bold">{formatStatPreview(totalReadingsCalculated)}</span>
              <span className="ml-1 text-white/30">({readingsBase || 0} Base + {liveData.completedBookingsCount} DB reports)</span>
            </p>
          </div>

          {/* Verified Experts Base Offset */}
          <div>
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-2">
              Verified Experts Base Offset (e.g. 50)
            </label>
            <input
              type="number"
              value={verifiedExpertsBase}
              onChange={(e) => setVerifiedExpertsBase(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 h-11 text-white text-base focus:border-[#7C3AED]/50 outline-none"
            />
            <p className="text-[11px] text-white/40 mt-1.5">
              Will show on Homepage: <span className="text-cyan-400 font-bold">{formatStatPreview(totalExpertsCalculated)}</span>
              <span className="ml-1 text-white/30">({verifiedExpertsBase || 0} Base + {liveData.astrologersCount} DB astrologers)</span>
            </p>
          </div>

          {/* User Rating Override */}
          <div>
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-2">
              User Rating Override (e.g. 4.9)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              placeholder="Leave empty for auto-calculate from user reviews"
              value={userRatingOverride}
              onChange={(e) => setUserRatingOverride(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 h-11 text-white text-base focus:border-[#7C3AED]/50 outline-none"
            />
            <p className="text-[11px] text-white/40 mt-1.5">
              Leave blank to automatically calculate average from user 5-star ratings.
            </p>
          </div>

          {/* Satisfaction Override */}
          <div>
            <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-2">
              Satisfaction % Override (e.g. 98)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              placeholder="Leave empty for auto-calculate from % >= 4 stars"
              value={satisfactionOverride}
              onChange={(e) => setSatisfactionOverride(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 h-11 text-white text-base focus:border-[#7C3AED]/50 outline-none"
            />
            <p className="text-[11px] text-white/40 mt-1.5">
              Leave blank to automatically calculate % of reviews with 4+ stars.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="ua-btn-primary px-6 py-3 text-sm font-semibold shadow-lg shadow-[#7C3AED]/25 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Stats Settings"}
          </button>
        </div>
      </form>

      {/* Customer Ratings List */}
      <div className="ua-card p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Recent Customer Ratings ({liveData.ratings.length})
        </h3>

        {liveData.ratings.length === 0 ? (
          <p className="text-white/40 text-sm py-4">No user ratings submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {liveData.ratings.map((r) => (
              <div
                key={r._id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {r.user?.name || "User"}
                    </span>
                    <span className="text-xs text-white/40">
                      ({r.user?.phone || ""})
                    </span>
                  </div>
                  {r.review && (
                    <p className="text-white/70 text-xs mt-1 italic">
                      "{r.review}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-300">
                    {r.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStats;
