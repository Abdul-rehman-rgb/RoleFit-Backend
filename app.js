const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { createCorsMiddleware } = require("./config/cors");
const { isProduction } = require("./config/env");
const uploadRoute = require("./routes/uploads");
const analyzeRoute = require("./routes/analyze");
const authRoutes = require("./routes/auth.routes");
const interviewRoutes = require("./routes/interview.routes");

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

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("[DB]", error.message);
    res.status(503).json({ message: "Database unavailable" });
  }
});

app.use("/api/upload", uploadRoute);
app.use("/api/analyze", analyzeRoute);
app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

app.use((err, req, res, _next) => {
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  console.error("[Error]", err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
