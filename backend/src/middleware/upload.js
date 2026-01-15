import multer from "multer";
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
// 🟣 PDF UPLOAD - USE CLOUDINARY (PERMANENT STORAGE)
// ======================================================

const pdfFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf");
  if (isPdf) cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

// ✅ Cloudinary storage for PDFs (PERMANENT - never deleted)
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cosmic-compass-reports",
    resource_type: "raw",
    allowed_formats: ["pdf"],
  },
});

// ✅ Export PDF upload middleware using CLOUDINARY
export const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
