const express = require('express');
const multer = require('multer');
const { PDFParse } = require("pdf-parse");
const mammoth = require('mammoth');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('PDF or DOCX only'));
  }
});

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    let text = '';
    if (req.file.mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: req.file.buffer });
      try {
        const data = await parser.getText();
        text = data.text || "";
      } finally {
        await parser.destroy();
      }
    } else {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value;
    }
    res.json({ success: true, text, filename: req.file.originalname });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;