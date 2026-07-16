import { Router } from "express";
import { sendOtp, verifyOtp, me, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// OTP-based authentication
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected: get current user and update profile
router.get("/me", protect, me);
router.put("/update-profile", protect, updateProfile);

export default router;
