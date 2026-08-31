const Policy = require("../models/Policy");
const User = require("../models/User");
const { createAuditLog } = require("../services/auditService");

const createPolicy = async (req, res) => {
  try {
    const {
      policyNumber,
      policyholderId,
      coverageLimit,
      coveredTreatments,
      startDate,
      expiryDate,
      status,
    } = req.body;

    if (!policyNumber || !policyholderId || coverageLimit == null || !startDate || !expiryDate) {
      return res.status(400).json({
        message: "policyNumber, policyholderId, coverageLimit, startDate and expiryDate are required",
      });
    }

    const policyholder = await User.findById(policyholderId);
    if (!policyholder || policyholder.role !== "policyholder") {
      return res.status(400).json({ message: "Valid policyholder is required" });
    }

    const policy = await Policy.create({
      policyNumber,
      policyholderId,
      coverageLimit,
      coveredTreatments: coveredTreatments || [],
      startDate,
      expiryDate,
      status: status || "active",
    });

    await createAuditLog({
      userId: req.user._id,
      action: `Policy created: ${policy.policyNumber}`,
    });

    res.status(201).json({ message: "Policy created successfully", policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to create policy", error: error.message });
  }
};

const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find()
      .populate("policyholderId", "name email role")
      .sort({ createdAt: -1 });
    res.json({ policies });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch policies", error: error.message });
  }
};

const getMyPolicy = async (req, res) => {
  try {
    const policy = await Policy.findOne({ policyholderId: req.user._id }).populate(
      "policyholderId",
      "name email"
    );

    if (!policy) {
      return res.status(404).json({ message: "No policy found for this account" });
    }

    res.json({ policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch policy", error: error.message });
  }
};

const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate(
      "policyholderId",
      "name email role"
    );

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    if (
      req.user.role === "policyholder" &&
      String(policy.policyholderId._id) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: "You can only view your own policy" });
    }

    res.json({ policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch policy", error: error.message });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    const {
      coverageLimit,
      coveredTreatments,
      startDate,
      expiryDate,
      status,
    } = req.body;

    if (coverageLimit != null) policy.coverageLimit = coverageLimit;
    if (coveredTreatments) policy.coveredTreatments = coveredTreatments;
    if (startDate) policy.startDate = startDate;
    if (expiryDate) policy.expiryDate = expiryDate;
    if (status) policy.status = status;

    await policy.save();

    await createAuditLog({
      userId: req.user._id,
      action: `Policy updated: ${policy.policyNumber}`,
    });

    res.json({ message: "Policy updated successfully", policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to update policy", error: error.message });
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getMyPolicy,
  getPolicyById,
  updatePolicy,
};
