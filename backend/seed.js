// Seed default plans and coupon into MongoDB
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO = process.env.MONGO_URI;

const planSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  icon: String,
  originalPrice: Number,
  price: Number,
  badge: String,
  features: [String],
  colorFrom: String,
  colorTo: String,
  sortOrder: Number,
  active: Boolean,
}, { timestamps: true });

const couponSchema = new mongoose.Schema({
  code: { type: String, unique: true, uppercase: true },
  type: String,
  value: Number,
  active: Boolean,
  featured: Boolean,
  remainingUses: Number,
  startAt: Date,
  endAt: Date,
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
const Coupon = mongoose.model("Coupon", couponSchema);

async function seed() {
  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB");

  // Check if plans already exist
  const existingPlans = await Plan.countDocuments();
  if (existingPlans > 0) {
    console.log(`⚠️  ${existingPlans} plans already exist. Skipping plan seed.`);
  } else {
    // Create default plans
    await Plan.create([
      {
        name: "Starter",
        slug: "starter",
        icon: "auto_awesome",
        originalPrice: 299,
        price: 99,
        questionCount: 2,
        badge: "",
        features: [
          "Personalized Kundli Report",
          "2 Questions Answered",
          "Basic Remedies & Solutions",
          "PDF Report Delivery in 24hrs",
        ],
        colorFrom: "blue-600",
        colorTo: "indigo-600",
        sortOrder: 0,
        active: true,
      },
      {
        name: "Premium",
        slug: "premium",
        icon: "diamond",
        originalPrice: 499,
        price: 299,
        questionCount: 5,
        badge: "BEST VALUE ⭐",
        features: [
          "Detailed Kundli + Birth Chart",
          "5 Questions Answered",
          "Complete Remedies & Solutions",
          "15 min Call with Astrologer",
          "Priority Report Delivery",
        ],
        colorFrom: "purple-600",
        colorTo: "pink-600",
        sortOrder: 1,
        active: true,
      },
    ]);
    console.log("✅ Created 2 default plans (Starter & Premium)");
  }

  // Check/create URBAN200 coupon
  const existingCoupon = await Coupon.findOne({ code: "URBAN200" });
  if (existingCoupon) {
    // Just make sure it's featured
    if (!existingCoupon.featured) {
      existingCoupon.featured = true;
      await existingCoupon.save();
      console.log("✅ Marked existing URBAN200 coupon as featured");
    } else {
      console.log("⚠️  URBAN200 coupon already exists and is featured");
    }
  } else {
    await Coupon.create({
      code: "URBAN200",
      type: "flat",
      value: 200,
      active: true,
      featured: true,
      remainingUses: 100,
      startAt: new Date(),
    });
    console.log("✅ Created URBAN200 coupon (₹200 flat, featured, 100 uses)");
  }
  // Check/create RAJU50 coupon
  const existingRajuCoupon = await Coupon.findOne({ code: "RAJU50" });
  if (!existingRajuCoupon) {
    await Coupon.create({
      code: "RAJU50",
      type: "flat",
      value: 50,
      active: true,
      featured: false,
      remainingUses: 999999,
      startAt: new Date(),
    });
    console.log("✅ Created RAJU50 coupon (₹50 flat, 999999 uses)");
  } else {
    console.log("⚠️  RAJU50 coupon already exists");
  }
  await mongoose.disconnect();
  console.log("Done! 🎉");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
