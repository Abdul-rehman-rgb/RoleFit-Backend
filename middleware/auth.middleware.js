const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const blacklistModel = require("../models/blacklist.model");

const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    const err = new Error("Not authorized, no token");
    err.status = 401;
    throw err;
  }

  const blacklisted = await blacklistModel.findOne({ token });
  if (blacklisted) {
    const err = new Error("Not authorized, token revoked");
    err.status = 401;
    throw err;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const err = new Error("Not authorized, invalid token");
    err.status = 401;
    throw err;
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    const err = new Error("Not authorized, user not found");
    err.status = 401;
    throw err;
  }

  req.user = user;
  next();
};

module.exports = { protect };
