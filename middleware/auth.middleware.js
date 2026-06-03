const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const blacklistModel = require("../models/blacklist.model");

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const blacklisted = await blacklistModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Not authorized, token revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { protect };
