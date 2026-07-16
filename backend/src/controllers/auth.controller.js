import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { sendSms } from "../services/smsGatewayService.js";

const OTP_EXPIRY_MINUTES = 5;
const OTP_COOLDOWN_SECONDS = 60;
const OTP_DAILY_LIMIT = 10;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Validate Indian phone number: must be +91 followed by 10 digits starting with 6-9.
 */
function isValidIndianPhone(phone) {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
function generateOtp() {
  // crypto.randomInt is secure and avoids modulo bias
  return String(crypto.randomInt(100000, 999999));
}

// ─── POST /api/auth/send-otp ───────────────────────────────────────────────────
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body || {};

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        error: "Invalid phone number. Use +91 followed by 10 digits (e.g. +919876543210)",
      });
    }

    // ── Rate limiting checks ──────────────────────────────────────────────────
    const existing = await Otp.findOne({ phone });

    if (existing) {
      // 60-second cooldown
      const secondsSinceLastSent =
        (Date.now() - new Date(existing.lastSentAt).getTime()) / 1000;
      if (secondsSinceLastSent < OTP_COOLDOWN_SECONDS) {
        const wait = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastSent);
        return res.status(429).json({
          error: `Please wait ${wait} seconds before requesting another OTP`,
          retryAfter: wait,
        });
      }

      // Daily limit: reset counter if day has passed
      if (new Date() > existing.dailyCountResetAt) {
        existing.dailyCount = 0;
        const tomorrow = new Date();
        tomorrow.setHours(23, 59, 59, 999);
        existing.dailyCountResetAt = tomorrow;
      }

      if (existing.dailyCount >= OTP_DAILY_LIMIT) {
        return res.status(429).json({
          error: "Maximum OTP limit reached for today. Try again tomorrow.",
        });
      }
    }

    // ── Generate and hash OTP ─────────────────────────────────────────────────
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    if (existing) {
      existing.otpHash = otpHash;
      existing.expiresAt = expiresAt;
      existing.lastSentAt = new Date();
      existing.dailyCount += 1;
      await existing.save();
    } else {
      await Otp.create({
        phone,
        otpHash,
        expiresAt,
        dailyCount: 1,
        lastSentAt: new Date(),
      });
    }

    // ── Send SMS ──────────────────────────────────────────────────────────────
    const message = `UrbanAstro OTP: ${otp}\nValid for ${OTP_EXPIRY_MINUTES} minutes.\nNever share this OTP.`;

    const smsResult = await sendSms(phone, message);

    if (!smsResult.success) {
      console.error("[AUTH] SMS send failed:", smsResult.error);
      // Still return success to avoid leaking SMS delivery status to attackers
      // In production, you might want to handle this differently
    }

    console.log(`[AUTH] OTP sent to ${phone}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[AUTH] sendOtp error:", err);
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body || {};

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP are required" });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: "OTP must be a 6-digit number" });
    }

    // ── Find OTP record ───────────────────────────────────────────────────────
    const record = await Otp.findOne({ phone });

    if (!record) {
      console.warn(`[AUTH] Verification failed: No OTP record found in DB for ${phone}`);
      return res.status(400).json({ error: "No OTP found. Please request a new one." });
    }

    // ── Check expiry ──────────────────────────────────────────────────────────
    if (new Date() > record.expiresAt) {
      console.warn(`[AUTH] Verification failed: OTP expired for ${phone}. Server Time: ${new Date().toISOString()}, Expiry Time: ${new Date(record.expiresAt).toISOString()}`);
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // ── Verify hash ───────────────────────────────────────────────────────────
    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      console.warn(`[AUTH] Verification failed: Entered OTP (${otp}) does not match stored hash for ${phone}`);
      return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
    }

    // ── OTP verified — delete it ──────────────────────────────────────────────
    await Otp.deleteOne({ _id: record._id });

    // ── Find or create user ───────────────────────────────────────────────────
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        phone,
        name: name || "",
      });
      console.log(`[AUTH] New user created: ${phone}`);
    } else if (name && !user.name) {
      // Update name if user exists but has no name set
      user.name = name;
      await user.save();
    }

    const token = signToken(user._id);

    console.log(`[AUTH] ✅ User ${phone} verified and logged in`);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
      },
      token,
      isNewUser,
    });
  } catch (err) {
    console.error("[AUTH] verifyOtp error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const me = async (req, res) => {
  res.json({ user: req.user });
};

// ─── PUT /api/auth/update-profile ─────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name.trim();
    await user.save();

    console.log(`[AUTH] Profile updated for user ${user.phone}: name = "${user.name}"`);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("[AUTH] updateProfile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

