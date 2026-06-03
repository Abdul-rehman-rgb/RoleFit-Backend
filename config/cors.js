const cors = require("cors");
const { getAllowedOrigins } = require("./env");

function createCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();

  return cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}

module.exports = { createCorsMiddleware };
