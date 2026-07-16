import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL: auto-delete when expiresAt is reached
  },
  dailyCount: {
    type: Number,
    default: 1,
  },
  dailyCountResetAt: {
    type: Date,
    default: () => {
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);
      return tomorrow;
    },
  },
  lastSentAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Otp", otpSchema);
