const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const { createCorsMiddleware } = require("../config/cors");
const { getAllowedOrigins } = require("../config/env");
const { asyncHandler } = require("../utils/asyncHandler");

function attachErrorHandler(app) {
  app.use((err, req, res, _next) => {
    const origin = req.headers.origin;
    if (origin) {
      const normalized = origin.replace(/\/+$/, "");
      if (getAllowedOrigins().includes(normalized) ||
          normalized === "https://role-fit-nine.vercel.app" ||
          normalized === "http://localhost:5173") {
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
}

function createBaseApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(createCorsMiddleware());
  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  const withDb = asyncHandler(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {
      error.status = 503;
      throw error;
    }
  });

  return { app, withDb, attachErrorHandler };
}

module.exports = { createBaseApp, attachErrorHandler };
