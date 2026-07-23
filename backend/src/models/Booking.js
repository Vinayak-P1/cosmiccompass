import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    phone: String,
    email: String,
    birthDate: String,
    birthTime: String,
    birthLocation: String,
    unknownTime: { type: Boolean, default: false },
    selectedLifeAreas: { type: [String], default: [] },
    question: String,

    // Plan
    plan: {
      type: String,
      default: "starter",
    },
    screenshot: { type: String, default: "" },

    // Pricing
    amount: { type: Number, required: true },
    promoApplied: { type: Boolean, default: false },
    coupon: { type: String, default: "" },

    // Payment
    status: {
      type: String,
      enum: ["pending", "awaiting_verification", "paid", "inprogress", "completed", "disapproved"],
      default: "pending",
    },
    orderId: String,
    paymentId: String,
    signature: String,
    // Manual payment UTR / transaction id when user pays via QR/UPI
    utr: { type: String, default: "" },

    // QR tracking — which location's QR brought this user
    refSource: { type: String, default: "" },

    // Report linkage
    report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" },
    // Astrologer linkage
    astrologer: { type: mongoose.Schema.Types.ObjectId, ref: "Astrologer" },

    // User Rating & Review
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: "" },
    ratedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
