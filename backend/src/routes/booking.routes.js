// src/routes/booking.routes.js
import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  checkout,
  myBookings,
  listAll,
  uploadReport,
  viewReport,
  deleteReport,
  cleanupOldReports,
} from "../controllers/booking.controller.js";
import { submitManualPayment, approveBooking, disapproveBooking } from "../controllers/booking.controller.js";
import { pdfUpload, imageUpload } from "../middleware/upload.js";

const router = Router();

// user bookings and payments
router.post("/checkout", protect, checkout);
// Manual QR payment: user submits UTR and screenshot after scanning QR
router.post("/manual", protect, imageUpload.single("screenshot"), submitManualPayment);
router.get("/me", protect, myBookings);

// Admin approve/disapprove
router.put("/:id/approve", protect, adminOnly, approveBooking);
router.put("/:id/disapprove", protect, adminOnly, disapproveBooking);

// admin list and upload
router.get("/admin/all", protect, adminOnly, listAll);

// PDF upload with error handling for multer
router.post(
  "/:bookingId/report/upload",
  protect,
  adminOnly,
  (req, res, next) => {
    pdfUpload.single("file")(req, res, (err) => {
      if (err) {
        console.error("MULTER ERROR:", err);
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      }
      next();
    });
  },
  uploadReport
);

// Admin cleanup old local reports - BEFORE other routes to skip auth checks
router.get("/admin/cleanup-old-reports", cleanupOldReports);
router.post("/admin/cleanup-old-reports", cleanupOldReports);

// view/download report
router.get("/report/view/:bookingId", viewReport);

// delete report (ADMIN) - allows admin to delete and re-upload
router.delete("/:bookingId/report/delete", protect, adminOnly, deleteReport);

export default router;
