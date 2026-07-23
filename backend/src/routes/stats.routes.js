import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getPublicStats,
  getAdminStatsSettings,
  updateAdminStatsSettings,
} from "../controllers/stats.controller.js";

const router = Router();

// Public route for home page stats
router.get("/public", getPublicStats);

// Admin routes for inspecting and updating base offsets & overrides
router.get("/admin", protect, adminOnly, getAdminStatsSettings);
router.put("/admin", protect, adminOnly, updateAdminStatsSettings);

export default router;
