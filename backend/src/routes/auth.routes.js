import { Router } from "express";
import { sendOtp, verifyOtp, me } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// OTP-based authentication
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected: get current user
router.get("/me", protect, me);

export default router;
