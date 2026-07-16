import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ["flat", "percent"],
    default: "flat",
  },
  value: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  remainingUses: {
    type: Number,
    default: 999999,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  startAt: Date,
  endAt: Date,
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
