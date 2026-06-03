const multer = require("multer");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX resume files are allowed"));
    }
  },
});

const uploadResumeFile = upload.single("resumeFile");

async function extractTextFromResumeFile(file) {
  if (!file?.buffer) {
    throw new Error("No resume file to parse");
  }

  const buffer = file.buffer;

  if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text?.trim() || "";
    } finally {
      await parser.destroy();
    }
  }

  const result = await mammoth.extractRawText({ buffer });
  return result.value?.trim() || "";
}

async function removeUploadedFile(_file) {
  // Memory storage — nothing to delete on disk
}

function handleResumeUpload(req, res, next) {
  uploadResumeFile(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Resume file must be 5MB or smaller"
          : err.message;
      return res.status(400).json({ success: false, message });
    }

    return res.status(400).json({ success: false, message: err.message });
  });
}

async function parseUploadedResume(req, res, next) {
  if (!req.file) return next();

  try {
    const text = await extractTextFromResumeFile(req.file);
    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from the uploaded resume",
      });
    }
    req.resumeText = text;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to parse resume file",
    });
  }
}

module.exports = {
  handleResumeUpload,
  parseUploadedResume,
  removeUploadedFile,
  extractTextFromResumeFile,
};
