import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ExternalLink, Calendar, Plus, Crown, Zap, Clock, ShieldCheck, AlertCircle, Star, Sparkles } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "";

/* Reuse same robust PDF opener as admin page */
async function openPdfUrlInNewTab(url, headers = {}) {
  try {
    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      window.open(url, "_blank");
      return;
    }
    const buffer = await resp.arrayBuffer();
    const blob = new Blob([buffer], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
  } catch (e) {
    console.error("openPdfUrlInNewTab error:", e);
    window.open(url, "_blank");
  }
}

const RatingSection = ({ booking, onRatingSubmitted }) => {
  const [selectedStars, setSelectedStars] = useState(booking.rating || 0);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewText, setReviewText] = useState(booking.review || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!booking.rating);
  const [error, setError] = useState("");

  const handleSubmitRating = async () => {
    if (selectedStars === 0) {
      setError("Please select at least 1 star rating.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSubmitting(true);
      setError("");
      const res = await fetch(`${API}/api/bookings/${booking._id}/rate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: selectedStars,
          review: reviewText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        if (onRatingSubmitted) onRatingSubmitted(booking._id, selectedStars, reviewText);
      } else {
        setError(data.error || "Failed to submit rating");
      }
    } catch (e) {
      console.error("Submit rating error:", e);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted || booking.rating) {
    return (
      <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= (booking.rating || selectedStars)
                    ? "fill-amber-400 text-amber-400"
                    : "text-white/20"
                }`}
              />
            ))}
          </div>
          <span className="ml-1 text-sm font-extrabold text-white">
            {booking.rating || selectedStars}/5
          </span>
          <span className="text-emerald-400 text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
            Rating Submitted
          </span>
        </div>
        {(booking.review || reviewText) && (
          <p className="text-white/70 italic mt-1 font-normal">
            "{booking.review || reviewText}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Rate Your Consultation:
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHoverStars(s)}
              onMouseLeave={() => setHoverStars(0)}
              onClick={() => setSelectedStars(s)}
              className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  s <= (hoverStars || selectedStars)
                    ? "fill-amber-400 text-amber-400"
                    : "text-white/20 hover:text-amber-400/50"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {selectedStars > 0 && (
        <div className="space-y-2 animate-fade-up">
          <input
            type="text"
            placeholder="Write a quick review / feedback (optional)..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/25 focus:border-[#7C3AED]/50 outline-none"
          />
          {error && <p className="text-[11px] text-red-400">{error}</p>}
          <button
            onClick={handleSubmitRating}
            disabled={submitting}
            className="ua-btn-primary text-xs py-2 px-4 w-full justify-center shadow-md shadow-[#7C3AED]/20"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </div>
  );
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API}/api/bookings/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data.items || []);
      else alert(data.error || "Failed to fetch bookings");
    } catch (e) {
      console.error("Fetch bookings error:", e);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleRatingSubmitted = (bookingId, rating, review) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, rating, review } : b))
    );
  };

  const badge = (s) => {
    if (s === "completed")
      return <span className="ua-badge ua-badge-success">Completed</span>;
    if (s === "inprogress" || s === "paid")
      return <span className="ua-badge ua-badge-warning">In Progress</span>;
    if (s === "awaiting_verification")
      return <span className="ua-badge ua-badge-accent">Awaiting Verification</span>;
    if (s === "pending")
      return <span className="ua-badge ua-badge-warning">Pending</span>;
    if (s === "disapproved")
      return (
        <span
          className="ua-badge"
          style={{
            background: "rgba(239,68,68,0.1)",
            color: "#ef4444",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          Disapproved
        </span>
      );
    return <span className="ua-badge ua-badge-default">{s}</span>;
  };

  return (
    <div className="font-display text-gray-200 min-h-screen flex flex-col items-center pt-24 p-6 relative overflow-hidden">
      {/* ── Glow Blobs ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/8 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
        <div className="text-center mb-8 animate-fade-up">
          <div className="ua-section-label mb-3">
            <span className="dot" />
            <span className="text">Dashboard</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            My <span className="text-[#7C3AED]">Consultations</span>
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="ua-card p-10 text-center w-full animate-fade-up">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 text-base mb-6">No bookings found yet.</p>
            <button
              onClick={() => navigate("/consultation")}
              className="ua-btn-primary mx-auto"
            >
              <Plus className="w-4 h-4" />
              Start New Consultation
            </button>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="ua-card p-5 sm:p-6 transition-all duration-300 hover:border-white/20 animate-fade-up"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        b.plan === "premium"
                          ? "bg-[#7C3AED]/20 text-[#22D3EE] border border-[#7C3AED]/30"
                          : "bg-white/[0.06] text-white/70 border border-white/[0.08]"
                      }`}
                    >
                      {b.plan === "premium" ? (
                        <>
                          <Crown className="w-3 h-3 text-[#22D3EE]" /> Premium
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-white/50" /> Starter
                        </>
                      )}
                    </span>
                  </div>
                  {badge(b.status)}
                </div>

                <div className="mb-3">
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-1.5">
                    My Questions:
                  </span>
                  <div className="whitespace-pre-wrap text-sm text-white/80 bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06] leading-relaxed">
                    {b.question || "General Reading"}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-white/30" />
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-white">
                    Amount: ₹{(b.amount / 100).toFixed(0)}
                  </span>
                </div>

                {/* Report PDF View */}
                {b.report && (
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("token") || "";
                        fetch(`${API}/api/bookings/report/view/${b._id}`, {
                          headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                        })
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.fileUrl) {
                              openPdfUrlInNewTab(
                                data.fileUrl,
                                token
                                  ? { Authorization: `Bearer ${token}` }
                                  : {}
                              );
                            } else {
                              alert(data.error || "Failed to load report");
                            }
                          })
                          .catch((e) => {
                            console.error("Fetch error:", e);
                            alert("Error: " + e.message);
                          });
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#22D3EE] hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Report PDF</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Rating Section — for Completed Consultations */}
                {b.status === "completed" && (
                  <RatingSection
                    booking={b}
                    onRatingSubmitted={handleRatingSubmitted}
                  />
                )}
              </div>
            ))}

            <div className="pt-4 text-center">
              <button
                onClick={() => navigate("/consultation")}
                className="ua-btn-primary"
              >
                <Plus className="w-4 h-4" />
                Start New Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;