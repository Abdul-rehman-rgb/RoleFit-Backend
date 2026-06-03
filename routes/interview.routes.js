const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const {
  handleResumeUpload,
  parseUploadedResume,
} = require("../middleware/file.middleware");
const {
  createInterviewReport,
  getLastInterviewReport,
} = require("../controllers/interview.controller");

const router = express.Router();

router.use(protect);
router.get("/last", getLastInterviewReport);
router.post(
  "/",
  handleResumeUpload,
  parseUploadedResume,
  createInterviewReport
);

module.exports = router;
