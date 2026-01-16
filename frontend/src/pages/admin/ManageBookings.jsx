import React, { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL || "";

/* Robust PDF opener: fetches the file and opens a blob URL in a new tab.
   This avoids the browser treating the Cloudinary URL as an attachment
   (which can produce strange download filenames). */
async function openPdfUrlInNewTab(url, headers = {}) {
  try {
    const resp = await fetch(url, { headers });
    if (!resp.ok) {
      // fallback to direct open
      window.open(url, "_blank");
      return;
    }
    const buffer = await resp.arrayBuffer();
    const blob = new Blob([buffer], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    // Revoke after a minute to free memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
  } catch (e) {
    console.error("openPdfUrlInNewTab error:", e);
    // last resort
    window.open(url, "_blank");
  }
}

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [fileMap, setFileMap] = useState({});
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    const res = await fetch(`${API}/api/bookings/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBookings(data.items || []);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleFileChange = (bookingId, file) => {
    setFileMap((prev) => ({ ...prev, [bookingId]: file }));
  };

  const uploadReport = async (bookingId) => {
    const file = fileMap[bookingId];
    if (!file) return alert("Select a PDF first!");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API}/api/bookings/${bookingId}/report/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await res.json();
    if (data.success) {
      alert("Report uploaded successfully!");
      fetchBookings();
    } else {
      alert(data.error || "Error uploading report");
    }
  };

  const approveBooking = async (bookingId) => {
    if (!confirm("Approve this booking (UTR verified)?")) return;
    const res = await fetch(`${API}/api/bookings/${bookingId}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await res.json();
    if (j.success) {
      alert("Booking approved. It is now In Progress.");
      fetchBookings();
    } else alert(j.error || "Approve failed");
  };

  const disapproveBooking = async (bookingId) => {
    if (!confirm("Disapprove this booking (UTR mismatch)?")) return;
    const res = await fetch(`${API}/api/bookings/${bookingId}/disapprove`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await res.json();
    if (j.success) {
      alert("Booking disapproved.");
      fetchBookings();
    } else alert(j.error || "Disapprove failed");
  };

  const deleteReport = async (bookingId) => {
    if (!confirm("Delete this report? You will be able to upload a new one.")) return;
    const res = await fetch(`${API}/api/bookings/${bookingId}/report/delete`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const j = await res.json();
    if (j.success) {
      alert("Report deleted successfully. You can now upload a new one.");
      fetchBookings();
    } else alert(j.error || "Delete failed");
  };

  return (
    <div className="min-h-screen bg-[#0B0B1A] text-white pt-24 md:pt-28 lg:pt-32 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">All User Bookings</h1>

        {bookings.map((b) => (
          <div key={b._id} className="p-5 bg-white/10 rounded-lg mb-4">
            <h2 className="text-xl font-bold">{b.name} — {b.email}</h2>
            <p className="text-sm text-gray-300">
              Question: {b.question || "N/A"}<br/>
              Areas: {b.selectedLifeAreas?.join(", ") || "N/A"}<br/>
              Status:{" "}
              <span
                className={`font-bold ${
                  b.status === "completed"
                    ? "text-green-400"
                    : b.status === "paid"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {b.status}
              </span>
            </p>

            <div className="mt-2 text-sm text-gray-300">
              <div>Birth Date: <span className="font-semibold text-white">{b.birthDate || 'N/A'}</span></div>
              <div>Birth Time: <span className="font-semibold text-white">{b.birthTime || (b.unknownTime ? 'Unknown' : 'N/A')}</span></div>
              <div>Birth Place: <span className="font-semibold text-white">{b.birthLocation || 'N/A'}</span></div>
            </div>

            {b.utr && (
              <p className="mt-2 text-sm">Transaction ID: <span className="font-mono text-sm">{b.utr}</span></p>
            )}

            {b.report ? (
              <div className="mt-2 flex flex-col sm:flex-row items-start gap-3">
                <button
                  onClick={() => {
                    // Use token header for authenticated fetch (admin)
                    fetch(`${API}/api/bookings/report/view/${b._id}`, {
                      headers: { Authorization: `Bearer ${token}` }
                    })
                      .then(r => {
                        console.log('Response status:', r.status);
                        return r.json();
                      })
                      .then(data => {
                        console.log('View report response:', data);
                        if (data.fileUrl) {
                          console.log('Opening URL via blob helper:', data.fileUrl);
                          openPdfUrlInNewTab(data.fileUrl, { Authorization: `Bearer ${token}` });
                        } else {
                          alert(data.error || 'Failed to load report');
                        }
                      })
                      .catch(e => {
                        console.error('Fetch error:', e);
                        alert('Error: ' + e.message);
                      });
                  }}
                  className="text-blue-400 underline"
                >
                  View Report
                </button>
                <button
                  onClick={() => deleteReport(b._id)}
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white"
                >
                  Delete & Re-upload
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start gap-3 mt-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(b._id, e.target.files[0])}
                  className="bg-white/10 p-3 rounded w-full"
                />
                <button
                  onClick={() => uploadReport(b._id)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded sm:ml-2 sm:flex-shrink-0"
                >
                  Upload PDF & Complete
                </button>
              </div>
            )}

            {b.status === 'awaiting_verification' && (
              <div className="flex gap-3 mt-3">
                <button onClick={() => approveBooking(b._id)} className="bg-blue-600 px-3 py-2 rounded">Approve</button>
                <button onClick={() => disapproveBooking(b._id)} className="bg-red-600 px-3 py-2 rounded">Disapprove</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageBookings;