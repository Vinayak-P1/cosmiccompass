import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    readingsBase: { type: Number, default: 10000 },
    verifiedExpertsBase: { type: Number, default: 50 },
    userRatingOverride: { type: Number, default: null }, // If null, auto-calculated from reviews
    satisfactionOverride: { type: Number, default: null }, // If null, auto-calculated from % of >= 4 stars
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
