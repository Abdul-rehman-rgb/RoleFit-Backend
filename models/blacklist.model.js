const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required"],
    unique: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Blacklist", blacklistSchema);