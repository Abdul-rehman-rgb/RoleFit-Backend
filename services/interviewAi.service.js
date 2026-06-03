const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { parseAiReport, unwrapReport } = require("../utils/parseReport");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY,
});

const interviewReportSchema = z.object({
  candidate_name: z.string().describe("Candidate full name from resume"),
  job_title: z.string().describe("Job title from the job description"),
  experience_years: z
    .number()
    .describe("Years of professional experience inferred from resume"),
  match_percentage: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall job match percentage 0-100"),
  technical_alignment: z
    .string()
    .describe('e.g. "High", "Medium", or "Low"'),
  experience_gap: z
    .string()
    .describe(
      "Paragraph on experience level vs job requirements and resume issues",
    ),
  core_skills_match: z
    .array(z.string())
    .describe("Skills from the JD that the candidate has"),
  missing_skills: z
    .array(z.string())
    .describe("Required or nice-to-have skills the candidate lacks"),
  strengths: z.array(z.string()).describe("Candidate strengths for this role"),
  weaknesses: z
    .array(z.string())
    .describe("Gaps, concerns, and weaknesses for this role"),
  hiring_recommendation: z
    .string()
    .describe("Clear hiring recommendation and next steps"),
});

async function generateInterviewReport({
  resume = "",
  selfDescription = "",
  jobDescription = "",
} = {}) {
  if (!resume && !selfDescription) {
    throw new Error("Resume or self description is required");
  }
  if (!jobDescription) {
    throw new Error("Job description is required");
  }

  const prompt = `You are an expert technical recruiter. Analyze the candidate against the job description.

Return a single JSON object (NOT an array). You MUST populate every field:
- candidate_name: full name from the resume
- job_title: role title from the job description
- experience_years: number (e.g. 2)
- match_percentage: integer 0-100 (overall fit; e.g. 65 means 65% match)
- technical_alignment: "High", "Medium", or "Low"
- experience_gap: one paragraph comparing required vs actual experience
- core_skills_match: array of skills the candidate HAS that the JD requires
- missing_skills: array of skills the JD requires but the candidate lacks
- strengths, weaknesses, hiring_recommendation

Resume:
${resume}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  const raw = JSON.parse(response.text);
  if (!raw.match_percentage && !raw.skills_match_score) {
    console.log("[Interview AI] raw keys:", Object.keys(unwrapReport(raw) || {}));
  }
  const report = parseAiReport(raw);
  console.log(
    "[Interview AI] match_percentage:",
    report.match_percentage,
    "candidate:",
    report.candidate_name,
  );

  return report;
}

module.exports = { generateInterviewReport };
