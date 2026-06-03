function toMatchPercent(score) {
  if (score == null || score === "") return null;
  const n = Number(score);
  if (Number.isNaN(n)) return null;
  if (n > 0 && n <= 1) return Math.round(n * 100);
  return Math.min(100, Math.max(0, Math.round(n)));
}

function toListArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return trimmed
      .split(/\n|•|;/)
      .map((s) => s.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function unwrapReport(raw) {
  if (Array.isArray(raw)) return raw[0] || null;
  if (raw?.report && typeof raw.report === "object") {
    return Array.isArray(raw.report) ? raw.report[0] : raw.report;
  }
  return raw;
}

const MATCH_KEY_RE =
  /^(match_percentage|matchPercentage|match_score|matchScore|skills_match_score|overall_score|overall_match|job_match_score)$/i;

function deepFindMatchScore(obj, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 3) return null;

  for (const [key, value] of Object.entries(obj)) {
    if (MATCH_KEY_RE.test(key) || /match|score/i.test(key)) {
      const percent = toMatchPercent(value);
      if (percent != null && percent > 0) return percent;
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = deepFindMatchScore(value, depth + 1);
      if (found != null && found > 0) return found;
    }
  }

  return null;
}

function estimateMatchScore(r) {
  const core = toListArray(r.core_skills_match ?? r.coreSkillsMatch);
  const missing = toListArray(r.missing_skills ?? r.missingSkills);
  const coreLen = core.length;
  const missingLen = missing.length;

  if (coreLen + missingLen > 0) {
    return Math.round((coreLen / (coreLen + missingLen)) * 100);
  }

  const sLen = toListArray(r.strengths).length;
  const wLen = toListArray(r.weaknesses).length;

  if (sLen + wLen > 0) {
    return Math.min(95, Math.max(20, Math.round((sLen / (sLen + wLen)) * 100)));
  }

  return null;
}

function extractMatchScore(r) {
  const direct = toMatchPercent(
    r.match_percentage ??
      r.matchPercentage ??
      r.skills_match_score ??
      r.matchScore ??
      null,
  );
  if (direct != null && direct > 0) return direct;

  const deep = deepFindMatchScore(r);
  if (deep != null && deep > 0) return deep;

  const estimated = estimateMatchScore(r);
  if (estimated != null && estimated > 0) return estimated;

  return 0;
}

function deepFindString(obj, keys, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 3) return "";

  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = deepFindString(value, keys, depth + 1);
      if (found) return found;
    }
  }

  return "";
}

/** Normalize any AI/DB shape into one API response object for the client. */
function parseAiReport(raw) {
  const r = unwrapReport(raw);
  if (!r || typeof r !== "object") {
    throw new Error("Invalid interview report from AI");
  }

  const matchScore = extractMatchScore(r);

  const candidate_name =
    deepFindString(r, [
      "candidate_name",
      "candidateName",
      "candidate",
      "name",
    ]) || "";

  const job_title =
    deepFindString(r, ["job_title", "jobTitle", "title", "role", "position"]) ||
    "";

  const experience_years =
    r.experience_years ?? r.experienceYears ?? deepFindNumber(r, "experience_years");

  return {
    candidate_name,
    job_title,
    experience_years: experience_years ?? null,
    match_percentage: matchScore,
    technical_alignment:
      deepFindString(r, [
        "technical_alignment",
        "technicalAlignment",
        "technical_fit",
      ]) || "",
    experience_gap:
      deepFindString(r, [
        "experience_gap",
        "experienceGap",
        "overall_assessment",
        "overallAssessment",
      ]) || "",
    core_skills_match: toListArray(r.core_skills_match ?? r.coreSkillsMatch),
    missing_skills: toListArray(r.missing_skills ?? r.missingSkills),
    strengths: toListArray(r.strengths),
    weaknesses: toListArray(r.weaknesses),
    hiring_recommendation:
      deepFindString(r, [
        "hiring_recommendation",
        "hiringRecommendation",
        "interview_recommendation",
        "interviewRecommendation",
      ]) || "",
    interview_notes:
      deepFindString(r, ["interview_notes", "interviewNotes", "notes"]) || "",
  };
}

function deepFindNumber(obj, key, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 3) return null;
  if (obj[key] != null) {
    const n = Number(obj[key]);
    if (!Number.isNaN(n)) return n;
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = deepFindNumber(value, key, depth + 1);
      if (found != null) return found;
    }
  }
  return null;
}

function documentToReport(doc) {
  if (!doc) return null;
  return parseAiReport({
    candidate_name: doc.candidateName,
    job_title: doc.jobTitle,
    experience_years: doc.experienceYears,
    match_percentage: doc.matchScore,
    technical_alignment: doc.technicalAlignment,
    experience_gap: doc.experienceGap,
    core_skills_match: doc.coreSkillsMatch,
    missing_skills: doc.missingSkills,
    strengths: doc.strengths,
    weaknesses: doc.weaknesses,
    hiring_recommendation: doc.hiringRecommendation || doc.interviewRecommendation,
    interview_notes: doc.interviewNotes,
  });
}

module.exports = { parseAiReport, documentToReport, toMatchPercent, unwrapReport, extractMatchScore };
