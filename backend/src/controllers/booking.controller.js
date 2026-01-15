// src/controllers/booking.controller.js
import Booking from "../models/Booking.js";
import Report from "../models/Report.js";
import Coupon from "../models/Coupon.js";
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

    // req.file.path is the Cloudinary URL when using CloudinaryStorage
    const fileUrl = req.file.path; // Cloudinary provides the full URL

    // store in DB
    const report = await Report.create({
      booking: booking._id,
      fileUrl: fileUrl, // Store the Cloudinary URL
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
// Redirects to Cloudinary URL where the PDF is hosted
export const viewReport = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("report");
    if (!booking || !booking.report)
      return res.status(404).json({ error: "Report not found" });

    // Redirect to Cloudinary URL
    res.redirect(booking.report.fileUrl);
  } catch (err) {
    console.error("VIEW REPORT ERROR =>", err);
    res.status(500).json({ error: "Error fetching PDF" });
  }
};

// ---------------- Manual payment submission (QR/UPI flow)
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
    } = req.body;

    if (!utr || !utr.trim()) return res.status(400).json({ error: "Transaction id (UTR) is required" });

    const BASE = Number(process.env.BASE_PRICE || 149);
    const couponDoc = await getValidCoupon(couponCode);
    const finalRupees = priceAfterCoupon(BASE, couponDoc);
    const amountPaise = toPaise(finalRupees);

    // create booking tied to user
    const booking = await Booking.create({
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
      utr: utr.trim(),
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