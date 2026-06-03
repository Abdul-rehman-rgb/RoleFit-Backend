const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { createCorsMiddleware } = require("./config/cors");
const { isProduction } = require("./config/env");
const { asyncHandler } = require("./utils/asyncHandler");

const uploadRoute = require(path.join(__dirname, "routes/uploads"));
const analyzeRoute = require(path.join(__dirname, "routes/analyze"));
const authRoutes = require(path.join(__dirname, "routes/auth.routes"));
const interviewRoutes = require(path.join(__dirname, "routes/interview.routes"));

const app = express();

if (isProduction()) {
  app.set("trust proxy", 1);
}

app.use(createCorsMiddleware());
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const withDb = asyncHandler(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    error.status = 503;
    throw error;
  }
});

app.use("/api/upload", withDb, uploadRoute);
app.use("/api/analyze", withDb, analyzeRoute);
app.use("/api/auth", withDb, authRoutes);
app.use("/api/interview", withDb, interviewRoutes);

app.use((err, req, res, _next) => {
  const { getAllowedOrigins } = require("./config/env");
  const origin = req.headers.origin;
  if (origin) {
    const normalized = origin.replace(/\/+$/, "");
    if (getAllowedOrigins().includes(normalized)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  console.error("[Error]", err.stack || err.message || err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
