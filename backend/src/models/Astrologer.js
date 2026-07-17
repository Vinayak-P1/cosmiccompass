import mongoose from "mongoose";

const astrologerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    expertise: { type: String, required: true }, // e.g. Love, Career, Finance
    experience: { type: Number, default: 0 }, // years of experience
    bio: { type: String },
    imageUrl: { type: String }, // profile pic (optional)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

astrologerSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

export default mongoose.model("Astrologer", astrologerSchema);
