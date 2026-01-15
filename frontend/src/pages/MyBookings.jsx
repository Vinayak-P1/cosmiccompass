import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    (async () => {
      const res = await fetch(`${API}/api/bookings/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setBookings(data.items || []);
      else alert(data.error || "Failed to fetch bookings");
    })();
  }, []);

  const badge = (s) => {
    if (s === "completed") return <span className="text-xs px-2 py-1 rounded bg-green-600">Completed</span>;
    if (s === "inprogress" || s === "paid") return <span className="text-xs px-2 py-1 rounded bg-yellow-600">In Progress</span>;
    if (s === "awaiting_verification") return <span className="text-xs px-2 py-1 rounded bg-orange-500">Awaiting Verification</span>;
    if (s === "pending") return <span className="text-xs px-2 py-1 rounded bg-yellow-700">Pending</span>;
    if (s === "disapproved") return <span className="text-xs px-2 py-1 rounded bg-red-600">Disapproved</span>;
    return <span className="text-xs px-2 py-1 rounded bg-red-600">{s}</span>;
    };

  return (
    <div className="font-display bg-background-dark text-slate-200 min-h-screen flex flex-col items-center pt-24 p-6">
      <h2 className="text-3xl font-bold mb-6">My Consultations</h2>

      {bookings.length === 0 ? (
        <p>No bookings found yet.</p>
      ) : (
        bookings.map((b) => (
          <div key={b._id} className="bg-white/10 p-4 rounded-lg w-full max-w-xl mb-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-lg">{b.question || "General Reading"}</p>
              {badge(b.status)}
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Amount: ₹{(b.amount / 100).toFixed(2)} · {new Date(b.createdAt).toLocaleDateString()}
            </p>

            {b.report && (
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  fetch(`${API}/api/bookings/report/view/${b._id}`)
                  .then(r => r.json())
                  .then(data => {
                    if (data.fileUrl) {
                      window.open(data.fileUrl, '_blank');
                    } else {
                      alert(data.error || 'Failed to load report');
                    }
                  })
                  .catch(e => alert('Error: ' + e.message));
                }}
                className="inline-block mt-3 text-blue-400 underline"
              >
                View Report
              </button>
            )}
          </div>
        ))
      )}

      <button
        onClick={() => navigate("/consultation")}
        className="mt-6 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg"
      >
        Start New Consultation
      </button>
    </div>
  );
};

export default MyBookings;
