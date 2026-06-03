const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(protect);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText) return res.status(400).json({ error: 'Resume text required' });

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyst.
Analyze this resume and return ONLY valid JSON, no markdown, no explanation.

${jobDescription ? `Target Job Description:\n${jobDescription}\n` : ''}

Resume:
${resumeText}

Return this exact JSON structure:
{
  "overall_score": <number 0-100>,
  "sections": {
    "contact": { "score": <0-100>, "issues": ["..."] },
    "summary": { "score": <0-100>, "issues": ["..."] },
    "skills": { "score": <0-100>, "issues": ["..."] },
    "experience": { "score": <0-100>, "issues": ["..."] },
    "education": { "score": <0-100>, "issues": ["..."] }
  },
  "missing_keywords": ["keyword1", "keyword2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "strengths": ["strength 1", "strength 2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().replace(/```json|```/g, '').trim();
    const data = JSON.parse(raw);
    res.json({ success: true, analysis: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;