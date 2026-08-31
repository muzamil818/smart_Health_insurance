const Claim = require("../models/Claim");
const { validateClaim } = require("./claimValidation");
const { calculateFraudScore } = require("./fraudScoring");
const { notifyUser } = require("./notificationService");
const { createAuditLog } = require("./auditService");

const processSubmittedClaim = async (claim, actorUserId) => {
  const validationResults = await validateClaim(claim);
  const fraudScore = await calculateFraudScore(claim);

  claim.validationResults = validationResults;
  claim.status = "under_review";
  await claim.save();

  await notifyUser({
    userId: claim.policyholderId,
    claimId: claim._id,
    message: "Your claim is under review.",
  });

  await createAuditLog({
    userId: actorUserId,
    action: `System generated fraud score (${fraudScore.score}/100, ${fraudScore.riskLevel}) for Claim ${claim._id}`,
    claimId: claim._id,
  });

  return { validationResults, fraudScore, claim };
};

module.exports = { processSubmittedClaim };
