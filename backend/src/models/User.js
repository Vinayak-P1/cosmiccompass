import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
