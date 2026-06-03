const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../utils/asyncHandler");

const { register, login, logout, me } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/logout", asyncHandler(logout));
router.get("/me", asyncHandler(protect), asyncHandler(me));

module.exports = router;
