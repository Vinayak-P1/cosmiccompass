import multer from "multer";
import path from "path";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// ======================================================
// 🟢 IMAGE UPLOAD (for astrologers, profile pictures)
// ======================================================
export const imageUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "cosmic-compass-profiles",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      resource_type: "image",
      access_mode: "public",
    },
  }),
});

// ======================================================
// 🟣 PDF UPLOAD - USE LOCAL STORAGE (SIMPLE & RELIABLE)
// ======================================================

const pdfFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf");
  if (isPdf) cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

// ✅ Ensure upload folder exists
const uploadsDir = path.resolve("uploads");
const reportsDir = path.join(uploadsDir, "reports");

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log("✅ Created uploads/reports directory");
}

// ✅ Simple local storage for PDFs
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, reportsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp to avoid conflicts
    const sanitized = path.basename(file.originalname);
    const timestamp = Date.now();
    cb(null, `${timestamp}-${sanitized}`);
  },
});

// ✅ Export PDF upload middleware using LOCAL STORAGE
export const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
