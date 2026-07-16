import Plan from "../models/Plan.js";

// ===== PUBLIC =====

// Get all active plans (sorted by sortOrder)
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true }).sort({ sortOrder: 1 });
    res.json({ ok: true, plans });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to fetch plans" });
  }
};

// Get all plans including inactive (admin)
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ sortOrder: 1 });
    res.json({ ok: true, plans });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to fetch plans" });
  }
};

// Get single plan
export const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ ok: false, error: "Plan not found" });
    res.json({ ok: true, plan });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to fetch plan" });
  }
};

// ===== ADMIN =====

// Create plan
export const createPlan = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ ok: false, error: "Admin only" });

    const { name, icon, originalPrice, price, questionCount, badge, features, colorFrom, colorTo, sortOrder } = req.body;
    if (!name || originalPrice === undefined || price === undefined) {
      return res.status(400).json({ ok: false, error: "Name, originalPrice and price are required" });
    }

    const plan = await Plan.create({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      icon: icon || "auto_awesome",
      originalPrice: Number(originalPrice),
      price: Number(price),
      questionCount: questionCount ? Number(questionCount) : 2,
      badge: badge || "",
      features: features || [],
      colorFrom: colorFrom || "blue-600",
      colorTo: colorTo || "indigo-600",
      sortOrder: sortOrder ?? 0,
      active: true,
    });

    res.json({ ok: true, plan });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ ok: false, error: "A plan with that name already exists" });
    }
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Update plan
export const updatePlan = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ ok: false, error: "Admin only" });

    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ ok: false, error: "Plan not found" });

    const fields = ["name", "icon", "originalPrice", "price", "questionCount", "badge", "features", "colorFrom", "colorTo", "sortOrder", "active"];
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        if (f === "questionCount") {
          plan[f] = Number(req.body[f]);
        } else {
          plan[f] = req.body[f];
        }
      }
    }

    // Update slug if name changed
    if (req.body.name) {
      plan.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    await plan.save();
    res.json({ ok: true, plan });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Delete plan
export const deletePlan = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ ok: false, error: "Admin only" });

    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ ok: false, error: "Plan not found" });

    res.json({ ok: true, message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// Legacy endpoint for backwards compat
export const getPricing = async (req, res) => {
  try {
    const plan = await Plan.findOne({ active: true }).sort({ sortOrder: 1 });
    res.json({
      ok: true,
      pricing: plan
        ? { basePrice: plan.price, description: plan.name }
        : { basePrice: 99, description: "Starter Consultation" },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Failed to fetch pricing" });
  }
};
