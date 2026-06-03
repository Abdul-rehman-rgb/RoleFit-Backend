const mongoose = require("mongoose");

const globalCache = global;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL is not set");
  }

  if (!globalCache._mongoosePromise) {
    globalCache._mongoosePromise = mongoose
      .connect(uri)
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
