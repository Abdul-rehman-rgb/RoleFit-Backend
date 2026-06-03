const cors = require("cors");
const { getAllowedOrigins } = require("./env");

function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      console.warn("[CORS] Blocked origin:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}

module.exports = { createCorsMiddleware };
