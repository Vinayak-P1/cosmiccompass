// src/app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
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
import Astrologer from "./models/Astrologer.js";

// ✅ Fix for __dirname and __filename in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ CORS lockdown: allow localhost and production domain
const allowedOrigins = [
  "http://localhost:5173",
  "https://cosmiccompass-7sox.onrender.com",
  "https://compass-7sox.onrender.com",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile redirects, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy violation: Access from specified Origin is denied."), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ✅ Custom NoSQL Injection Sanitizer Middleware
// Recursively strips any keys starting with "$" to prevent Mongo Query Injection
const nosqlSanitizer = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.startsWith("$")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

// ✅ Handle JSON, urlencoded and webhook properly
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    // Set 500kb JSON body size limit to prevent huge payload DoS attacks
    express.json({ limit: "500kb" })(req, res, (err) => {
      if (err) {
        console.error("JSON parse error:", err);
        return res.status(400).json({ error: "Invalid JSON format" });
      }
      // Set 500kb urlencoded body size limit
      express.urlencoded({ extended: true, limit: "500kb" })(req, res, next);
    });
  }
});

// ✅ Apply NoSQL Sanitizer globally
app.use(nosqlSanitizer);

// ✅ Helmet configuration (adds CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));

// ✅ Rate Limiter for API Routes to prevent brute force & spam
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { error: "Too many requests from this IP. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", generalLimiter);

// ✅ Stricter Rate Limiter for Authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 OTP requests per window
  message: { error: "Too many login/verification requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/send-otp", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);

// ✅ Health check
app.get("/health", (req, res) =>
  res.json({ ok: true, service: "urbanastro", time: new Date() })
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

// ✅ Dynamic sitemap.xml endpoint with 10-minute caching
let cachedSitemap = null;
let cacheTimestamp = 0;

app.get("/sitemap.xml", async (req, res) => {
  try {
    const now = Date.now();
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

    if (cachedSitemap && (now - cacheTimestamp < CACHE_DURATION)) {
      res.header("Content-Type", "application/xml");
      res.header("Cache-Control", "public, max-age=600");
      return res.status(200).send(cachedSitemap);
    }

    const astrologers = await Astrologer.find({ isActive: { $ne: false } });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static public pages
    xml += `  <url>\n    <loc>https://urbanastro.space/</loc>\n    <lastmod>2026-07-18</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://urbanastro.space/astrologers</loc>\n    <lastmod>2026-07-18</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://urbanastro.space/askai</loc>\n    <lastmod>2026-07-18</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://urbanastro.space/login</loc>\n    <lastmod>2026-07-18</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;

    // Dynamic active astrologer profile pages
    astrologers.forEach((a) => {
      const slug = a.slug || a.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const dateStr = a.updatedAt
        ? new Date(a.updatedAt).toISOString().split("T")[0]
        : "2026-07-18";
      xml += `  <url>\n    <loc>https://urbanastro.space/astrologers/${slug}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    cachedSitemap = xml;
    cacheTimestamp = now;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=600");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Error generating sitemap");
  }
});

// ✅ Global Error Handler (prevents html error leaks, keeps messages generic in production)
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  
  res.status(status).json({
    error: isProd ? "An internal server error occurred." : (err.message || "Internal Server Error"),
  });
});

export default app;
