const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const FraudScore = require("../models/FraudScore");

const HIGH_AMOUNT_THRESHOLD = 500000;
const HIGH_AMOUNT_RATIO = 0.7;
const DUPLICATE_WINDOW_DAYS = 90;
const RECENT_CLAIMS_WINDOW_DAYS = 30;
const RECENT_CLAIMS_LIMIT = 3;
const SUSPICIOUS_HOSPITAL_WINDOW_DAYS = 30;
const SUSPICIOUS_HOSPITAL_LIMIT = 8;

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const getRiskLevel = (score) => {
  if (score <= 30) return "low";
  if (score <= 60) return "medium";
  return "high";
};

const calculateFraudScore = async (claim) => {
  const triggeredRules = [];
  let score = 0;
  const policy = await Policy.findById(claim.policyId);

  const highByAmount = claim.claimAmount >= HIGH_AMOUNT_THRESHOLD;
  const highByCoverage =
    policy && claim.claimAmount >= policy.coverageLimit * HIGH_AMOUNT_RATIO;

  if (highByAmount || highByCoverage) {
    score += 30;
    triggeredRules.push({ rule: "Unusually high claim amount", points: 30 });
  }

  const duplicate = await Claim.findOne({
    _id: { $ne: claim._id },
    policyholderId: claim.policyholderId,
    hospitalId: claim.hospitalId,
    treatment: claim.treatment,
    claimAmount: claim.claimAmount,
    createdAt: { $gte: daysAgo(DUPLICATE_WINDOW_DAYS) },
  });

  if (duplicate) {
    score += 30;
    triggeredRules.push({ rule: "Duplicate claim", points: 30 });
  }

  const recentCount = await Claim.countDocuments({
    _id: { $ne: claim._id },
    policyholderId: claim.policyholderId,
    createdAt: { $gte: daysAgo(RECENT_CLAIMS_WINDOW_DAYS) },
  });

  if (recentCount >= RECENT_CLAIMS_LIMIT) {
    score += 20;
    triggeredRules.push({ rule: "Multiple recent claims", points: 20 });
  }

  const treatmentMismatch =
    !policy ||
    !policy.coveredTreatments.some(
      (item) => item.toLowerCase() === claim.treatment.toLowerCase()
    );

  if (treatmentMismatch) {
    score += 20;
    triggeredRules.push({
      rule: "Unusual treatment / policy mismatch",
      points: 20,
    });
  }

  const hospitalRecentCount = await Claim.countDocuments({
    _id: { $ne: claim._id },
    hospitalId: claim.hospitalId,
    createdAt: { $gte: daysAgo(SUSPICIOUS_HOSPITAL_WINDOW_DAYS) },
  });

  if (hospitalRecentCount >= SUSPICIOUS_HOSPITAL_LIMIT) {
    score += 20;
    triggeredRules.push({ rule: "Suspicious hospital pattern", points: 20 });
  }

  const cappedScore = Math.min(score, 100);
  const riskLevel = getRiskLevel(cappedScore);

  const fraudScore = await FraudScore.create({
    claimId: claim._id,
    score: cappedScore,
    riskLevel,
    triggeredRules,
    calculatedAt: new Date(),
  });

  return fraudScore;
};

const FRAUD_RULES = [
  { rule: "Unusually high claim amount", points: 30 },
  { rule: "Duplicate claim", points: 30 },
  { rule: "Multiple recent claims", points: 20 },
  { rule: "Unusual treatment / policy mismatch", points: 20 },
  { rule: "Suspicious hospital pattern", points: 20 },
];

module.exports = { calculateFraudScore, FRAUD_RULES, getRiskLevel };
