// src/controllers/booking.controller.js
import Booking from "../models/Booking.js";
import Report from "../models/Report.js";
import Coupon from "../models/Coupon.js";
import Plan from "../models/Plan.js";
import cloudinary from "cloudinary";
// Node 18+ has global fetch. If you are on older Node, install node-fetch.
const toPaise = (r) => Math.round(Number(r) * 100);
// ---------------- Coupon helpers ----------------
function priceAfterCoupon(base, couponDoc) {
  if (!couponDoc) return base;
  if (couponDoc.type === "percent") {
    return Math.max(0, Math.round(base - (base * couponDoc.value) / 100));
  }
  // flat
  return Math.max(0, base - couponDoc.value);
}

async function getValidCoupon(code) {
  if (!code) return null;
  const c = await Coupon.findOne({ code: String(code).toUpperCase() });
  const now = new Date();
  if (!c || !c.active) return null;
  if (c.startAt && c.startAt > now) return null;
  if (c.endAt && c.endAt < now) return null;
  if (typeof c.remainingUses === "number" && c.remainingUses <= 0) return null;
  return c;
}

// ---------------- Checkout ----------------
export const checkout = async (req, res) => {
  try {
    const {
      name,
      email,
      birthDate,
      birthTime = "",
      birthLocation,
      unknownTime = false,
      selectedLifeAreas = [],
      question = "",
      couponCode = "",
    } = req.body;

    const BASE = Number(process.env.BASE_PRICE || 149);
    const couponDoc = await getValidCoupon(couponCode);
    const finalRupees = priceAfterCoupon(BASE, couponDoc);
    const amountPaise = toPaise(finalRupees);

    let booking = await Booking.findOne({
      user: req.user._id,
      status: { $in: ["pending", "failed"] },
    });

    if (!booking) {
      booking = await Booking.create({
        user: req.user._id,
        name,
        email,
        birthDate,
        birthTime,
        birthLocation,
        unknownTime,
        selectedLifeAreas,
        question,
        amount: amountPaise,
        promoApplied: !!couponDoc,
        coupon: couponDoc ? couponDoc.code : "",
      });
    } else {
      booking.set({
        name,
        email,
        birthDate,
        birthTime,
        birthLocation,
        unknownTime,
        selectedLifeAreas,
        question,
        amount: amountPaise,
        promoApplied: !!couponDoc,
        coupon: couponDoc ? couponDoc.code : "",
      });
    }

    // Temporary payment flow: mark payment as pending and return booking
    booking.paymentStatus = "PENDING";
    await booking.save();

    res.json({
      success: true,
      bookingId: booking._id,
      amount: amountPaise,
      promoApplied: !!couponDoc,
      paymentStatus: booking.paymentStatus,
    });
  } catch (e) {
    console.error("CHECKOUT ERROR =>", e);
    res.status(500).json({ error: e.message });
  }
};

// ---------------- Lists ----------------
export const myBookings = async (req, res) => {
  const items = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("report");
  res.json({ items });
};

export const listAll = async (req, res) => {
  const items = await Booking.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("report");
  res.json({ items });
};

// ---------------- Upload Report (ADMIN) ----------------
export const uploadReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Cloudinary returns the secure_url after upload
    const fileUrl = req.file.secure_url || req.file.path;
    
    if (!fileUrl) {
      console.error("❌ No URL from Cloudinary:", req.file);
      return res.status(400).json({ error: "Failed to upload file to Cloudinary" });
    }
    
    console.log("✅ File uploaded to Cloudinary:", fileUrl);

    // store in DB
    const report = await Report.create({
      booking: booking._id,
      fileUrl: fileUrl,
      deliveredAt: new Date(),
    });

    booking.report = report._id;
    booking.status = "completed";
    await booking.save();

    res.json({ success: true, report });
  } catch (err) {
    console.error("UPLOAD REPORT ERROR =>", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- View/Download Report (USER) ----------------
// Returns Cloudinary URL for the PDF so browser can fetch it directly
export const viewReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("report");
    
    if (!booking || !booking.report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const fileUrl = booking.report.fileUrl;
    
    if (!fileUrl) {
      return res.status(404).json({ error: "Report file URL not found" });
    }

    console.log("✅ Returning report URL:", fileUrl);
    
    // Return the URL as JSON so frontend can open it
    return res.json({ 
      success: true, 
      fileUrl: fileUrl
    });
  } catch (err) {
    console.error("VIEW REPORT ERROR =>", err);
    res.status(500).json({ error: "Error fetching PDF" });
  }
};

// ---------------- Delete Report (ADMIN) ----------------
export const deleteReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("report");

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (!booking.report) return res.status(404).json({ error: "No report found for this booking" });

    const reportId = booking.report._id;
    const fileUrl = booking.report.fileUrl;

    // Delete from Cloudinary if URL exists
    if (fileUrl) {
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/xxx/image/upload/v123/folder/public_id.pdf
        const urlParts = fileUrl.split("/");
        const fileName = urlParts[urlParts.length - 1]; // e.g., "public_id.pdf"
        const publicId = fileName.replace(".pdf", ""); // remove extension
        const folder = urlParts[urlParts.length - 2]; // get folder name
        const fullPublicId = `${folder}/${publicId}`; // construct full public_id
        
        await cloudinary.v2.uploader.destroy(fullPublicId);
        console.log("✅ Deleted from Cloudinary:", fullPublicId);
      } catch (cloudinaryErr) {
        console.error("⚠️ Error deleting from Cloudinary:", cloudinaryErr);
        // Don't fail the entire operation if Cloudinary delete fails
      }
    }

    // Delete report from database
    await Report.findByIdAndDelete(reportId);

    // Remove report reference from booking and reset status
    booking.report = null;
    booking.status = "inprogress"; // Reset to inprogress so admin can re-upload
    await booking.save();

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("DELETE REPORT ERROR =>", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- Manual payment submission (QR/UPI flow)
// Plan-based pricing: starter=299, premium=499 (before coupon)
const PLAN_PRICES = { starter: 299, premium: 499 };

export const submitManualPayment = async (req, res) => {
  try {
    const {
      name,
      email,
      birthDate,
      birthTime = "",
      birthLocation,
      unknownTime = false,
      selectedLifeAreas = [],
      question = "",
      couponCode = "",
      utr = "",
      plan = "starter",
      refSource = "",
    } = req.body;

    if (!utr || !utr.trim()) return res.status(400).json({ error: "Transaction id (UTR) is required" });

    let finalLifeAreas = selectedLifeAreas;
    if (typeof selectedLifeAreas === "string" && selectedLifeAreas.trim()) {
      try {
        finalLifeAreas = JSON.parse(selectedLifeAreas);
      } catch (e) {
        finalLifeAreas = selectedLifeAreas.split(",").map(x => x.trim()).filter(Boolean);
      }
    }

    // Dynamically look up the plan price from the database
    let basePlan = 299; // Default fallback
    const planDoc = await Plan.findOne({ slug: String(plan).toLowerCase() });
    if (planDoc) {
      basePlan = planDoc.originalPrice;
    } else {
      // Try by ID
      const planDocById = await Plan.findById(plan).catch(() => null);
      if (planDocById) {
        basePlan = planDocById.originalPrice;
      }
    }

    const couponDoc = await getValidCoupon(couponCode);
    const finalRupees = priceAfterCoupon(basePlan, couponDoc);
    const amountPaise = toPaise(finalRupees);

    let screenshot = "";
    if (req.file) {
      screenshot = req.file.path || req.file.url || req.file.secure_url || "";
    }

    // create booking tied to user
    const booking = await Booking.create({
      user: req.user._id,
      name,
      email,
      birthDate,
      birthTime,
      birthLocation,
      unknownTime,
      selectedLifeAreas: finalLifeAreas,
      question,
      plan,
      amount: amountPaise,
      promoApplied: !!couponDoc,
      coupon: couponDoc ? couponDoc.code : "",
      utr: utr.trim(),
      screenshot,
      refSource: refSource || "",
      status: "awaiting_verification",
    });

    res.json({ success: true, bookingId: booking._id, status: booking.status });
  } catch (e) {
    console.error("MANUAL PAYMENT ERROR =>", e);
    res.status(500).json({ error: e.message });
  }
};

// ---------------- Admin approve / disapprove booking
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // On approve, mark as inprogress and decrement coupon uses if present
    booking.status = "inprogress";
    if (booking.coupon) {
      await Coupon.updateOne({ code: booking.coupon }, { $inc: { remainingUses: -1 } });
    }
    await booking.save();
    res.json({ success: true, booking });
  } catch (e) {
    console.error("APPROVE ERROR =>", e);
    res.status(500).json({ error: e.message });
  }
};

export const disapproveBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    booking.status = "disapproved";
    await booking.save();
    res.json({ success: true, booking });
  } catch (e) {
    console.error("DISAPPROVE ERROR =>", e);
    res.status(500).json({ error: e.message });
  }
};

// ================ ADMIN: Cleanup Old Local Reports ================
export const cleanupOldReports = async (req, res) => {
  try {
    console.log("Cleanup endpoint called");
    
    // Find all reports with old local file paths
    const oldReports = await Report.find({ 
      fileUrl: { $regex: "^/uploads/reports/" } 
    });

    console.log(`Found ${oldReports.length} old reports`);

    if (oldReports.length === 0) {
      return res.json({ 
        success: true, 
        message: "No old reports found",
        deletedCount: 0 
      });
    }

    // Delete old report records
    const deleteResult = await Report.deleteMany({ 
      fileUrl: { $regex: "^/uploads/reports/" } 
    });
    
    // Remove report references from bookings
    const bookingResult = await Booking.updateMany(
      { report: { $in: oldReports.map(r => r._id) } },
      { $unset: { report: 1 } }
    );

    console.log(`Deleted ${deleteResult.deletedCount} reports, updated ${bookingResult.modifiedCount} bookings`);

    res.json({ 
      success: true, 
      message: "Old reports cleaned up successfully",
      deletedReports: deleteResult.deletedCount,
      updatedBookings: bookingResult.modifiedCount
    });
  } catch (e) {
    console.error("CLEANUP ERROR =>", e);
    res.status(500).json({ error: e.message });
  }
};