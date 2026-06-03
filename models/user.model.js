const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: [true, "username already exists"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "email already exists"],
  },
  password: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);