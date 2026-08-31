const Claim = require("../models/Claim");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Policy = require("../models/Policy");
const FraudScore = require("../models/FraudScore");
const AuditLog = require("../models/AuditLog");
const { FRAUD_RULES } = require("../services/fraudScoring");

const getReports = async (req, res) => {
  try {
    const [
      users,
      hospitals,
      policies,
      claims,
      pending,
      underReview,
      approved,
      rejected,
      moreInfo,
      highRisk,
    ] = await Promise.all([
      User.countDocuments(),
      Hospital.countDocuments(),
      Policy.countDocuments(),
      Claim.countDocuments(),
      Claim.countDocuments({ status: "pending" }),
      Claim.countDocuments({ status: "under_review" }),
      Claim.countDocuments({ status: "approved" }),
      Claim.countDocuments({ status: "rejected" }),
      Claim.countDocuments({ status: "more_information_required" }),
      FraudScore.countDocuments({ riskLevel: "high" }),
    ]);

    res.json({
      reports: {
        users,
        hospitals,
        policies,
        claims,
        claimsByStatus: {
          pending,
          under_review: underReview,
          approved,
          rejected,
          more_information_required: moreInfo,
        },
        highRiskScores: highRisk,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reports", error: error.message });
  }
};

const getFraudRules = async (_req, res) => {
  res.json({
    rules: FRAUD_RULES,
    riskLevels: {
      low: "0-30",
      medium: "31-60",
      high: "61+",
    },
  });
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: error.message });
  }
};

module.exports = { getReports, getFraudRules, getAuditLogs };
