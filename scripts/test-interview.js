/**
 * Quick test for generateInterviewReport (no HTTP route yet).
 * Run from server folder: npm run test:interview
 */
require("dotenv").config();

const { generateInterviewReport } = require("../services/interviewAi.service");

const sampleResume = `
John Doe
Software Engineer | john@example.com

Experience:
- Built REST APIs with Node.js and Express
- React frontends for internal dashboards
- MongoDB, JWT auth

Skills: JavaScript, React, Node.js, MongoDB, Git
`;

const sampleJob = `
Software Engineer — Backend focus
Requirements: Node.js, Express, MongoDB, REST APIs, authentication, 2+ years experience.
`;

async function main() {
  if (!process.env.GOOGLE_GENAI_API_KEY && !process.env.GEMINI_API_KEY) {
    console.error("Missing API key. Set GOOGLE_GENAI_API_KEY or GEMINI_API_KEY in server/.env");
    process.exit(1);
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    process.env.GOOGLE_GENAI_API_KEY = process.env.GEMINI_API_KEY;
  }

  console.log("Generating interview report (this may take 15–30 seconds)...\n");

  const report = await generateInterviewReport({
    resume: sampleResume,
    selfDescription: "",
    jobDescription: sampleJob,
  });

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
