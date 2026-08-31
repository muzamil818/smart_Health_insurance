const Policy = require("../models/Policy");
const Hospital = require("../models/Hospital");
const ClaimDocument = require("../models/ClaimDocument");

const REQUIRED_DOCUMENT_TYPES = ["medical report", "hospital bill"];

const validateClaim = async (claim) => {
  const checks = [];

  const policy = await Policy.findById(claim.policyId);
  const hospital = await Hospital.findById(claim.hospitalId);
  const documents = await ClaimDocument.find({ claimId: claim._id });

  const policyExists = Boolean(policy);
  checks.push({
    check: "Policy exists",
    passed: policyExists,
  });

  const belongsToPolicyholder =
    policyExists &&
    String(policy.policyholderId) === String(claim.policyholderId);
  checks.push({
    check: "Policy belongs to the policyholder",
    passed: belongsToPolicyholder,
  });

  const policyActive = policyExists && policy.status === "active";
  const withinDates =
    policyExists &&
    new Date(policy.startDate) <= new Date() &&
    new Date(policy.expiryDate) >= new Date();
  checks.push({
    check: "Policy is active",
    passed: policyActive && withinDates,
  });

  const treatmentCovered =
    policyExists &&
    Array.isArray(policy.coveredTreatments) &&
    policy.coveredTreatments.some(
      (item) => item.toLowerCase() === claim.treatment.toLowerCase()
    );
  checks.push({
    check: "Treatment is covered",
    passed: treatmentCovered,
  });

  const hospitalEligible = Boolean(hospital && hospital.isEligible);
  checks.push({
    check: "Hospital is eligible",
    passed: hospitalEligible,
  });

  const withinCoverage =
    policyExists && claim.claimAmount <= policy.coverageLimit;
  checks.push({
    check: "Claim amount is within coverage limit",
    passed: withinCoverage,
  });

  const uploadedTypes = documents.map((doc) => doc.documentType);
  const documentsComplete = REQUIRED_DOCUMENT_TYPES.every((type) =>
    uploadedTypes.includes(type)
  );
  checks.push({
    check: "Required documents are uploaded",
    passed: documentsComplete,
    details: {
      required: REQUIRED_DOCUMENT_TYPES,
      uploaded: uploadedTypes,
    },
  });

  return {
    isValid: checks.every((item) => item.passed),
    checks,
  };
};

module.exports = { validateClaim, REQUIRED_DOCUMENT_TYPES };
