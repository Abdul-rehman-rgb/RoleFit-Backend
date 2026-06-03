const InterviewReport = require("../models/interviewReport.model");
const { generateInterviewReport } = require("../services/interviewAi.service");
const { removeUploadedFile } = require("../middleware/file.middleware");
const { parseAiReport, documentToReport } = require("../utils/parseReport");

async function saveReportToDb(userId, payload, inputs) {
  const report = parseAiReport(payload);
  return InterviewReport.create({
    userId,
    resume: inputs.resume,
    selfDescription: inputs.selfDescription,
    jobDescription: inputs.jobDescription,
    candidateName: report.candidate_name,
    jobTitle: report.job_title,
    experienceYears: report.experience_years,
    matchScore: report.match_percentage,
    technicalAlignment: report.technical_alignment,
    experienceGap: report.experience_gap,
    coreSkillsMatch: report.core_skills_match,
    missingSkills: report.missing_skills,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    hiringRecommendation: report.hiring_recommendation,
    interviewNotes: report.interview_notes,
    overallAssessment: report.experience_gap,
    interviewRecommendation: report.hiring_recommendation,
  });
}

exports.createInterviewReport = async (req, res) => {
  try {
    const resumeFromBody = (req.body.resume || "").trim();
    const resumeFromFile = (req.resumeText || "").trim();
    const resume = resumeFromFile || resumeFromBody;
    const selfDescription = (req.body.selfDescription || "").trim();
    const jobDescription = (req.body.jobDescription || "").trim();

    if (!resume && !selfDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume text, resume file (PDF/DOCX), or self description is required",
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job description is required",
      });
    }

    console.log("[Interview] Generating report for user:", req.user._id);

    const rawReport = await generateInterviewReport({
      resume,
      selfDescription,
      jobDescription,
    });

    const report = parseAiReport(rawReport);
    console.log("[Interview] Report generated:", JSON.stringify(report, null, 2));

    try {
      await saveReportToDb(req.user._id, report, {
        resume,
        selfDescription,
        jobDescription,
      });
    } catch (dbError) {
      console.error("[Interview] DB save failed:", dbError.message);
    }

    res.status(201).json({
      success: true,
      message: "Interview report generated successfully",
      report,
    });
  } catch (error) {
    console.error("[Interview] Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await removeUploadedFile(req.file);
  }
};

exports.getLastInterviewReport = async (req, res) => {
  try {
    const doc = await InterviewReport.findOne({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "No saved report found. Generate one first.",
      });
    }

    const report = documentToReport(doc);
    res.json({
      success: true,
      report,
      generatedAt: doc.createdAt,
    });
  } catch (error) {
    console.error("[Interview] getLast error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
