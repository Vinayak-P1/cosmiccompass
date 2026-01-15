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
      access_mode: "public", // ensures public URLs
    },
  }),
});

// ======================================================
// 🟣 PDF UPLOAD (for reports) — try Cloudinary first, fallback to local
// ======================================================

// ✅ allow only PDFs
const pdfFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf");
  if (isPdf) cb(null, true);
  else cb(new Error("Only PDF files are allowed!"), false);
};

// ✅ Local storage fallback
const tempDir = path.resolve("uploads/reports");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const localPdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `${Date.now()}${ext}`);
  },
});

// ✅ Try Cloudinary first, fallback to local
let pdfUploadStorage;

try {
  // Try Cloudinary if credentials exist
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    pdfUploadStorage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "cosmic-compass-reports",
        format: async (req, file) => "pdf", // Force .pdf extension
        resource_type: "raw", // Auto-detect file type
        allowed_formats: ["pdf"],
        public_id: async (req, file) => {
          // Sanitize filename and remove extension to let Cloudinary add .pdf
          const sanitized = file.originalname
            .replace(/\.[^/.]+$/, "") // Remove existing extension
            .replace(/[^a-zA-Z0-9_-]/g, "_") // Replace special chars
            .substring(0, 100); // Limit length
          return `${sanitized}-${Date.now()}`;
        },
      },
    });
    console.log("✅ Using Cloudinary for PDF uploads");
  } else {
    throw new Error("Cloudinary credentials not set");
  }
} catch (err) {
  console.log("⚠️ Cloudinary not available, using local storage for PDFs:", err.message);
  pdfUploadStorage = localPdfStorage;
}

// ✅ PDF upload middleware
export const pdfUpload = multer({
  storage: pdfUploadStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});
