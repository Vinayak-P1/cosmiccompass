import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createCoupon,
  listCoupons,
  validateCoupon,
  toggleCoupon,
  toggleFeatured,
  getFeaturedCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

// Admin
router.post("/", protect, adminOnly, createCoupon);
router.get("/", protect, adminOnly, listCoupons);

// Admin toggle (active/inactive)
router.put("/:id/toggle", protect, adminOnly, toggleCoupon);

// Admin toggle featured
router.put("/:id/feature", protect, adminOnly, toggleFeatured);

// Admin delete coupon
router.delete("/:id", protect, adminOnly, deleteCoupon);

// Public: validate coupon
router.get("/validate", validateCoupon);

// Public: get featured coupon (for banner & payment pre-fill)
router.get("/featured", getFeaturedCoupon);

export default router;
