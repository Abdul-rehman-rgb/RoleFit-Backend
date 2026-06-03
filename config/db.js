const mongoose = require("mongoose");

const globalCache = global;

function validateEnv() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not set");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  validateEnv();

  if (!globalCache._mongoosePromise) {
    globalCache._mongoosePromise = mongoose
      .connect(process.env.MONGO_URL, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((connection) => {
        console.log("MongoDB connected successfully");
        return connection;
      })
      .catch((error) => {
        globalCache._mongoosePromise = null;
        throw error;
      });
  }

  return globalCache._mongoosePromise;
}

module.exports = connectDB;
