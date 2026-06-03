const mongoose = require('mongoose');

const technicalQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true,"Question is required"],
  },
  intention: {
    type: String,
    required: [true,"Intention is required"],
  },
  answer: {
    type: String,
    required: [true,"Answer is required"],
  },
},{
    _id: false,
});

const behavioralQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true,"Question is required"],
  },
  intention: {
    type: String,
  },
  answer: {
    type: String,
  },
},{
    _id: false,
});

const skillGapSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: [true,"Skill is required"],
  },
  severity: {
    type: String,
    required: [true,"Severity is required"],
    enum: ['low', 'medium', 'high'],
  },
},{
    _id: false,
});

const preparationPlanSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: [true,"Day is required"],
    min: 1,
    max: 30,
  },
  focus: {
    type: String,
    required: [true,"Focus is required"],
  },
  tasks: [{
    type: String,
    required: [true,"Task is required"],
  }],
},{});

const interviewReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobDescription: {
    type: String,
    required: [true,"Job description is required"],
  },
  resume: {
    type: String,
  },
  selfDescription: {
    type: String,
  },
  candidateName: {
    type: String,
    default: "",
  },
  jobTitle: {
    type: String,
    default: "",
  },
  experienceYears: {
    type: Number,
    default: null,
  },
  technicalAlignment: {
    type: String,
    default: "",
  },
  experienceGap: {
    type: String,
    default: "",
  },
  coreSkillsMatch: [{
    type: String,
  }],
  missingSkills: [{
    type: String,
  }],
  hiringRecommendation: {
    type: String,
    default: "",
  },
  overallAssessment: {
    type: String,
    default: "",
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  strengths: [{
    type: String,
  }],
  weaknesses: [{
    type: String,
  }],
  interviewRecommendation: {
    type: String,
    default: "",
  },
  interviewNotes: {
    type: String,
    default: "",
  },
  technicalQuestions: [technicalQuestionSchema],
  behavioralQuestions: [behavioralQuestionSchema],
  skillGaps: [skillGapSchema],
  preparationPlan: [preparationPlanSchema],
}, { timestamps: true });

module.exports = mongoose.model("InterviewReport", interviewReportSchema);