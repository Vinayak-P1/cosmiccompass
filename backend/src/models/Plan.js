import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "auto_awesome" },
    originalPrice: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    questionCount: { type: Number, default: 2, min: 1 },
    badge: { type: String, default: "" },
    features: [{ type: String }],
    colorFrom: { type: String, default: "blue-600" },
    colorTo: { type: String, default: "indigo-600" },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
planSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  next();
});

export default mongoose.model("Plan", planSchema);
