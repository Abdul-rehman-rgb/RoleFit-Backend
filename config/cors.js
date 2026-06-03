const cors = require("cors");
const { getAllowedOrigins } = require("./env");

const FRONTEND_ORIGIN = "https://role-fit-nine.vercel.app";

function createCorsMiddleware() {
  const allowedOrigins = new Set([
    ...getAllowedOrigins(),
    FRONTEND_ORIGIN,
    "http://localhost:5173",
  ]);

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.has(normalized)) {
        return callback(null, true);
      }
      console.warn("[CORS] Blocked origin:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "Accept",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Type"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

module.exports = { createCorsMiddleware };
