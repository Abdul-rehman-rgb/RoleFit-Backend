const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { createCorsMiddleware } = require("./config/cors");
const { isProduction } = require("./config/env");

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

function lazyRouter(routerPath) {
  let router;
  return (req, res, next) => {
    if (!router) {
      router = require(routerPath);
    }
    return router(req, res, next);
  };
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("[DB]", error.message);
    res.status(503).json({ message: "Database unavailable" });
  }
});

app.use("/api/upload", lazyRouter("./routes/uploads"));
app.use("/api/analyze", lazyRouter("./routes/analyze"));
app.use("/api/auth", lazyRouter("./routes/auth.routes"));
app.use("/api/interview", lazyRouter("./routes/interview.routes"));

app.use((err, req, res, _next) => {
  if (err.message?.startsWith("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  console.error("[Error]", err.message);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
