// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reportRoutes from "./routes/report.routes.js";
import astrologerRoutes from "./routes/astrologer.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import pricingRoutes from "./routes/pricing.routes.js";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix for __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS - BULLETPROOF VERSION
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// ✅ Handle preflight explicitly
app.options('*', cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// ✅ Handle JSON, urlencoded and webhook properly
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    express.json({ limit: "10mb" })(req, res, () => {
      express.urlencoded({ extended: true, limit: "10mb" })(req, res, next);
    });
  }
});

app.use(helmet());
app.use(morgan("dev"));

// ✅ Health check
app.get("/health", (req, res) =>
  res.json({ ok: true, service: "cosmic-compass", time: new Date() })
);

// ✅ CORS test endpoint
app.get("/cors-test", (req, res) =>
  res.json({ ok: true, message: "CORS is working!", time: new Date() })
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/astrologers", astrologerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/pricing", pricingRoutes);

// ✅ Serve static uploads (PDFs, images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default app;
