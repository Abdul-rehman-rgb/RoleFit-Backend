const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const { parseAiReport, unwrapReport } = require("../utils/parseReport");

async function launchBrowser() {
  if (process.env.VERCEL === "1") {
    const chromium = require("@sparticuz/chromium");
    const puppeteer = require("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }

  const puppeteer = require("puppeteer");
  return puppeteer.launch({ headless: true });
}

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
    "core_skills:",
    report.core_skills_match?.length ?? 0,
  );

  return report;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePdf };
