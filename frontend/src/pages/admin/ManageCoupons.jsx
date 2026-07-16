import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "";

const ManageCoupons = () => {
  const token = localStorage.getItem("token");
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [maxUses, setMaxUses] = useState("");

  // Fetch all coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCoupons(data.items || []);
    } catch (err) {
      console.error("Fetch coupons error:", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Add coupon
  const addCoupon = async () => {
    if (!couponCode || !discount) return alert("Please fill code and discount");

    try {
      const res = await fetch(`${API}/api/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          type: discountType,
          value: Number(discount),
          remainingUses: maxUses ? Number(maxUses) : 999999,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Coupon added successfully!");
        setCouponCode("");
        setDiscount("");
        setMaxUses("");
        fetchCoupons();
      } else {
        alert(data.error || "Failed to add coupon");
      }
    } catch (e) {
      console.error("Add coupon error:", e);
      alert("Server error while adding coupon");
    }
  };

  // Toggle active/inactive
  const toggleCoupon = async (id) => {
    try {
      const res = await fetch(`${API}/api/coupons/${id}/toggle`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  // Toggle featured
  const toggleFeatured = async (id) => {
    try {
      const res = await fetch(`${API}/api/coupons/${id}/feature`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error("Featured toggle error:", e);
    }
  };

  // Delete coupon
  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      const res = await fetch(`${API}/api/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B1A] text-white pt-24 md:pt-28 lg:pt-32 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Manage Coupons</h1>
        <p className="text-gray-400 mb-6">
          Mark one coupon as <span className="text-amber-400 font-bold">⭐ Featured</span> to show
          it on the plan selection banner and pre-fill it on the payment page.
        </p>

        {/* Add Coupon Form */}
        <div className="bg-white/5 border border-white/15 rounded-2xl p-5 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">add_circle</span>
            Add New Coupon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none w-full"
            />
            <input
              type="number"
              placeholder="Discount Value"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none w-full"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="bg-black/30 border border-white/20 rounded-lg px-3 py-3 text-white outline-none w-full cursor-pointer"
            >
              <option value="flat">₹ Flat</option>
              <option value="percent">% Off</option>
            </select>
            <input
              type="number"
              placeholder="Max Uses (default: unlimited)"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none w-full"
            />
            <button
              onClick={addCoupon}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 px-6 py-3 rounded-lg font-bold transition-all w-full cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">add</span>
                Add Coupon
              </span>
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        {coupons.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">
              confirmation_number
            </span>
            <p className="text-gray-400 text-lg">No coupons yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-white/15 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-white/10">
                  <th className="p-3 text-left text-sm font-semibold">Code</th>
                  <th className="p-3 text-left text-sm font-semibold">Discount</th>
                  <th className="p-3 text-left text-sm font-semibold">Uses Left</th>
                  <th className="p-3 text-center text-sm font-semibold">Status</th>
                  <th className="p-3 text-center text-sm font-semibold">
                    <span className="text-amber-400">⭐ Featured</span>
                  </th>
                  <th className="p-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c._id} className="border-t border-white/10 hover:bg-white/5 transition">
                    <td className="p-3">
                      <span className="font-mono font-bold text-white tracking-wider">{c.code}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-400 font-bold">
                        {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                      </span>
                      <span className="text-gray-500 text-xs ml-1">
                        ({c.type === "percent" ? "percent" : "flat"})
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">
                      {c.remainingUses >= 999999 ? "∞" : c.remainingUses}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleCoupon(c._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          c.active
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}
                      >
                        {c.active ? "Active ✅" : "Inactive 🚫"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleFeatured(c._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          c.featured
                            ? "bg-amber-500/30 text-amber-300 ring-2 ring-amber-400/50 hover:bg-amber-500/40"
                            : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                        }`}
                      >
                        {c.featured ? "⭐ Featured" : "Set Featured"}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteCoupon(c._id)}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-red-400 text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-300 text-sm">
            <span className="font-bold">⭐ Featured Coupon:</span> The featured coupon appears
            automatically on the plan selection page as a promotional banner, and pre-fills on the
            payment page. Only ONE coupon can be featured at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageCoupons;
