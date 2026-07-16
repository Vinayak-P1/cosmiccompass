import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "";

const ICONS = [
  "auto_awesome", "diamond", "star", "rocket_launch", "workspace_premium",
  "bolt", "favorite", "verified", "local_fire_department", "psychology",
];

const COLOR_PRESETS = [
  { label: "Blue → Indigo", from: "blue-600", to: "indigo-600" },
  { label: "Purple → Pink", from: "purple-600", to: "pink-600" },
  { label: "Emerald → Teal", from: "emerald-600", to: "teal-600" },
  { label: "Amber → Orange", from: "amber-500", to: "orange-500" },
  { label: "Rose → Red", from: "rose-500", to: "red-600" },
  { label: "Cyan → Blue", from: "cyan-500", to: "blue-600" },
];

const emptyPlan = {
  name: "",
  icon: "auto_awesome",
  originalPrice: "",
  price: "",
  questionCount: 2,
  badge: "",
  features: [""],
  colorFrom: "blue-600",
  colorTo: "indigo-600",
  sortOrder: 0,
  active: true,
};

const ManagePricing = () => {
  const token = localStorage.getItem("token");
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null); // null = list view, "new" = create, or plan._id = editing
  const [form, setForm] = useState({ ...emptyPlan });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API}/api/pricing/plans/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) setPlans(data.plans);
    } catch (err) {
      console.error("Fetch plans error:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const showMsg = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const startCreate = () => {
    setForm({ ...emptyPlan, sortOrder: plans.length });
    setEditing("new");
  };

  const startEdit = (plan) => {
    setForm({
      name: plan.name,
      icon: plan.icon,
      originalPrice: plan.originalPrice,
      price: plan.price,
      questionCount: plan.questionCount || 2,
      badge: plan.badge || "",
      features: plan.features.length > 0 ? [...plan.features] : [""],
      colorFrom: plan.colorFrom,
      colorTo: plan.colorTo,
      sortOrder: plan.sortOrder,
      active: plan.active,
    });
    setEditing(plan._id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ ...emptyPlan });
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const removeFeature = (idx) => {
    const f = form.features.filter((_, i) => i !== idx);
    setForm({ ...form, features: f.length ? f : [""] });
  };
  const updateFeature = (idx, val) => {
    const f = [...form.features];
    f[idx] = val;
    setForm({ ...form, features: f });
  };

  const handleSave = async () => {
    if (!form.name || !form.originalPrice || !form.price) {
      showMsg("❌ Name, Original Price and Price are required");
      return;
    }

    const cleanFeatures = form.features.filter((f) => f.trim() !== "");
    const payload = {
      ...form,
      originalPrice: Number(form.originalPrice),
      price: Number(form.price),
      questionCount: Number(form.questionCount || 2),
      sortOrder: Number(form.sortOrder),
      features: cleanFeatures,
    };

    try {
      setLoading(true);
      const isNew = editing === "new";
      const url = isNew ? `${API}/api/pricing/plans` : `${API}/api/pricing/plans/${editing}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        showMsg(isNew ? "✅ Plan created!" : "✅ Plan updated!");
        cancelEdit();
        fetchPlans();
      } else {
        showMsg(`❌ ${data.error || "Failed"}`);
      }
    } catch (err) {
      showMsg("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`${API}/api/pricing/plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) {
        showMsg("✅ Plan deleted");
        fetchPlans();
      }
    } catch (err) {
      showMsg("❌ Delete failed");
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      const res = await fetch(`${API}/api/pricing/plans/${plan._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !plan.active }),
      });
      const data = await res.json();
      if (data.ok) fetchPlans();
    } catch (err) {
      showMsg("❌ Toggle failed");
    }
  };

  // ===== FORM VIEW =====
  if (editing !== null) {
    const selectedColor = COLOR_PRESETS.find(
      (c) => c.from === form.colorFrom && c.to === form.colorTo
    );

    return (
      <div className="min-h-screen bg-[#0B0B1A] text-white pt-24 md:pt-28 lg:pt-32 px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {editing === "new" ? "Create New Plan" : "Edit Plan"}
            </h1>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-white transition">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-300">Plan Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Starter, Premium"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm({ ...form, icon: ic })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      form.icon === ic
                        ? "bg-blue-500 ring-2 ring-blue-400"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-white text-lg">{ic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Original Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  placeholder="299"
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Shown as strikethrough</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Selling Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="99"
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Price shown on payment page</p>
              </div>
            </div>

            {/* Allowed Questions */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-300">Allowed Questions Count *</label>
              <input
                type="number"
                min="1"
                value={form.questionCount}
                onChange={(e) => setForm({ ...form, questionCount: e.target.value })}
                placeholder="2"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Controls how many question inputs the user gets on checkout</p>
            </div>

            {/* Badge */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-300">Badge (optional)</label>
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="e.g. BEST VALUE ⭐"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Features / Bullet Points</label>
              {form.features.map((f, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    value={f}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                    className="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition"
                  >
                    <span className="material-symbols-outlined text-red-400 text-sm">delete</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Feature
              </button>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Color Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setForm({ ...form, colorFrom: c.from, colorTo: c.to })}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                      form.colorFrom === c.from && form.colorTo === c.to
                        ? "border-blue-400 bg-white/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-${c.from} to-${c.to}`}></div>
                    <span className="text-xs text-gray-300">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order & Active */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-300">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="w-5 h-5 rounded accent-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-300">Active (visible to users)</span>
                </label>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-medium ${
                  message.includes("✅")
                    ? "bg-green-500/20 border border-green-500/50 text-green-300"
                    : "bg-red-500/20 border border-red-500/50 text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 text-lg"
            >
              {loading ? "Saving..." : editing === "new" ? "Create Plan" : "Update Plan"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div className="min-h-screen bg-[#0B0B1A] text-white pt-24 md:pt-28 lg:pt-32 px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Manage Plans</h1>
            <p className="text-gray-400 mt-1">Create and manage pricing plans shown to users</p>
          </div>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 px-5 py-3 rounded-xl font-bold transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Plan
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm font-medium ${
              message.includes("✅")
                ? "bg-green-500/20 border border-green-500/50 text-green-300"
                : "bg-red-500/20 border border-red-500/50 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {plans.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-600 mb-4 block">
              sell
            </span>
            <p className="text-gray-400 text-lg">No plans yet. Create your first plan!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className={`bg-white/5 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${
                  plan.active ? "border-white/15" : "border-red-500/30 opacity-60"
                }`}
              >
                {/* Icon + Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${plan.colorFrom} to-${plan.colorTo} flex items-center justify-center shadow-lg shrink-0`}
                  >
                    <span className="material-symbols-outlined text-white text-2xl">{plan.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {plan.badge && (
                        <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                          {plan.badge}
                        </span>
                      )}
                      {!plan.active && (
                        <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
                          HIDDEN
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-gray-500 line-through text-sm">₹{plan.originalPrice}</span>
                      <span className="text-white font-bold text-lg">₹{plan.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {plan.features.length} features · Questions: {plan.questionCount || 2} · Order: {plan.sortOrder}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
                      plan.active
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                    }`}
                  >
                    {plan.active ? "Active ✅" : "Hidden 🚫"}
                  </button>
                  <button
                    onClick={() => startEdit(plan)}
                    className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition"
                  >
                    <span className="material-symbols-outlined text-blue-400 text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition"
                  >
                    <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePricing;
