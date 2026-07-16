import express from "express";
import {
  getPricing,
  getPlans,
  getAllPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/pricing.controller.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Legacy endpoint (backwards compat)
router.get("/", getPricing);

// ===== Plan CRUD =====

// Public: get active plans
router.get("/plans", getPlans);

// Admin: get ALL plans (including inactive)
router.get("/plans/all", protect, adminOnly, getAllPlans);

// Public: get single plan
router.get("/plans/:id", getPlan);

// Admin: create plan
router.post("/plans", protect, adminOnly, createPlan);

// Admin: update plan
router.put("/plans/:id", protect, adminOnly, updatePlan);

// Admin: delete plan
router.delete("/plans/:id", protect, adminOnly, deletePlan);

export default router;
