const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const FraudScore = require("../models/FraudScore");
const ApprovalRecord = require("../models/ApprovalRecord");
const ClaimDocument = require("../models/ClaimDocument");
const { processSubmittedClaim } = require("../services/claimProcessing");
const { notifyUser } = require("../services/notificationService");
const { createAuditLog } = require("../services/auditService");

const canAccessClaim = (user, claim) => {
  if (user.role === "admin" || user.role === "officer") return true;
  if (user.role === "policyholder") {
    return String(claim.policyholderId) === String(user._id);
  }
  if (user.role === "hospital") {
    return String(claim.hospitalId) === String(user.hospitalId);
  }
  return false;
};

const populateClaim = (query) =>
  query
    .populate("policyholderId", "name email role")
    .populate("hospitalId", "name registrationNumber isEligible")
    .populate("policyId", "policyNumber coverageLimit coveredTreatments status");

const createClaim = async (req, res) => {
  try {
    if (!req.user.hospitalId) {
      return res.status(400).json({
        message: "This hospital account is not linked to a hospital record",
      });
    }

    const { policyholderId, policyId, treatment, treatmentDate, claimAmount, description } =
      req.body;

    if (!policyholderId || !policyId || !treatment || !treatmentDate || claimAmount == null) {
      return res.status(400).json({
        message:
          "policyholderId, policyId, treatment, treatmentDate and claimAmount are required",
      });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(policyholderId)) {
      return res.status(400).json({ message: "Invalid Policyholder ID format. Please select a registered policyholder." });
    }

    const policyholder = await User.findById(policyholderId);
    if (!policyholder || policyholder.role !== "policyholder") {
      return res.status(400).json({ message: "Valid registered policyholder is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ message: "Invalid Policy ID format. Please select a valid active insurance policy." });
    }

    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found in system" });
    }

    const hospital = await Hospital.findById(req.user.hospitalId);
    if (!hospital) {
      return res.status(400).json({ message: "Hospital record not found" });
    }

    const claim = await Claim.create({
      policyholderId,
      hospitalId: req.user.hospitalId,
      policyId,
      treatment,
      treatmentDate,
      claimAmount,
      description: description || "",
      status: "pending",
      submittedAt: new Date(),
    });

    await notifyUser({
      userId: policyholderId,
      claimId: claim._id,
      message: "Your claim has been submitted.",
    });

    await createAuditLog({
      userId: req.user._id,
      action: `Hospital submitted Claim ${claim._id}`,
      claimId: claim._id,
    });

    const processed = await processSubmittedClaim(claim, req.user._id);

    const fullClaim = await populateClaim(Claim.findById(claim._id));

    res.status(201).json({
      message: "Claim submitted and sent for review",
      claim: fullClaim,
      validationResults: processed.validationResults,
      fraudScore: processed.fraudScore,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit claim", error: error.message });
  }
};

const getClaims = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "hospital") {
      filter.hospitalId = req.user.hospitalId;
    }

    const claims = await populateClaim(Claim.find(filter)).sort({ createdAt: -1 });
    res.json({ claims });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch claims", error: error.message });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await populateClaim(
      Claim.find({ policyholderId: req.user._id })
    ).sort({ createdAt: -1 });

    res.json({ claims });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch claims", error: error.message });
  }
};

const getClaimById = async (req, res) => {
  try {
    const claim = await populateClaim(Claim.findById(req.params.id));
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (!canAccessClaim(req.user, claim)) {
      return res.status(403).json({ message: "You are not allowed to view this claim" });
    }

    const documents = await ClaimDocument.find({ claimId: claim._id });
    const fraudScore = await FraudScore.findOne({ claimId: claim._id }).sort({
      createdAt: -1,
    });
    const approvalRecords = await ApprovalRecord.find({ claimId: claim._id })
      .populate("officerId", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      claim,
      documents,
      fraudScore,
      approvalRecords,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch claim", error: error.message });
  }
};

const updateClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (req.user.role === "hospital" && !canAccessClaim(req.user, claim)) {
      return res.status(403).json({ message: "You can only update your hospital's claims" });
    }

    if (req.user.role === "hospital" && claim.status !== "more_information_required") {
      return res.status(400).json({
        message: "Hospitals can only update claims that require additional information",
      });
    }

    const { treatment, treatmentDate, claimAmount, description } = req.body;
    if (treatment) claim.treatment = treatment;
    if (treatmentDate) claim.treatmentDate = treatmentDate;
    if (claimAmount != null) claim.claimAmount = claimAmount;
    if (description != null) claim.description = description;

    await claim.save();

    res.json({ message: "Claim updated successfully", claim });
  } catch (error) {
    res.status(500).json({ message: "Failed to update claim", error: error.message });
  }
};

const decideClaim = async (req, res, decision) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const { remarks } = req.body;

    claim.status = decision;
    await claim.save();

    const record = await ApprovalRecord.create({
      claimId: claim._id,
      officerId: req.user._id,
      decision,
      remarks: remarks || "",
      decidedAt: new Date(),
    });

    const messages = {
      approved: "Your claim has been approved.",
      rejected: "Your claim has been rejected.",
      more_information_required: "Additional information is required.",
    };

    await notifyUser({
      userId: claim.policyholderId,
      claimId: claim._id,
      message: messages[decision],
    });

    const actionLabels = {
      approved: "Officer approved",
      rejected: "Officer rejected",
      more_information_required: "Officer requested additional information for",
    };

    await createAuditLog({
      userId: req.user._id,
      action: `${actionLabels[decision]} Claim ${claim._id}`,
      claimId: claim._id,
    });

    res.json({
      message: `Claim ${decision.replace(/_/g, " ")}`,
      claim,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update claim decision", error: error.message });
  }
};

const approveClaim = (req, res) => decideClaim(req, res, "approved");
const rejectClaim = (req, res) => decideClaim(req, res, "rejected");
const requestInformation = (req, res) =>
  decideClaim(req, res, "more_information_required");

const getFraudScore = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (!canAccessClaim(req.user, claim)) {
      return res.status(403).json({ message: "You are not allowed to view this claim" });
    }

    const fraudScore = await FraudScore.findOne({ claimId: claim._id }).sort({
      createdAt: -1,
    });

    if (!fraudScore) {
      return res.status(404).json({ message: "Fraud score not found for this claim" });
    }

    res.json({ fraudScore });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch fraud score", error: error.message });
  }
};

const recalculateFraudScore = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    const processed = await processSubmittedClaim(claim, req.user._id);

    res.json({
      message: "Fraud score recalculated",
      fraudScore: processed.fraudScore,
      validationResults: processed.validationResults,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to calculate fraud score",
      error: error.message,
    });
  }
};

module.exports = {
  createClaim,
  getClaims,
  getMyClaims,
  getClaimById,
  updateClaim,
  approveClaim,
  rejectClaim,
  requestInformation,
  getFraudScore,
  recalculateFraudScore,
};
