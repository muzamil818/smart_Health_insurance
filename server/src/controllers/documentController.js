const Claim = require("../models/Claim");
const ClaimDocument = require("../models/ClaimDocument");
const { processSubmittedClaim } = require("../services/claimProcessing");
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

const uploadDocument = async (req, res) => {
  try {
    const claimId = req.body.claimId;
    const documentType = req.body.documentType || "medical report";

    if (!claimId) {
      return res.status(400).json({ message: "claimId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "A file is required" });
    }

    const claim = await Claim.findById(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (req.user.role === "hospital" && !canAccessClaim(req.user, claim)) {
      return res.status(403).json({ message: "You can only upload documents for your hospital claims" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const document = await ClaimDocument.create({
      claimId,
      documentType,
      fileUrl,
      uploadedAt: new Date(),
    });

    await createAuditLog({
      userId: req.user._id,
      action: `Document uploaded for Claim ${claim._id}`,
      claimId: claim._id,
    });

    if (
      claim.status === "pending" ||
      claim.status === "more_information_required"
    ) {
      await processSubmittedClaim(claim, req.user._id);
    }

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload document", error: error.message });
  }
};

const getDocumentsByClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (!canAccessClaim(req.user, claim)) {
      return res.status(403).json({ message: "You are not allowed to view these documents" });
    }

    const documents = await ClaimDocument.find({ claimId: claim._id }).sort({
      createdAt: -1,
    });

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch documents", error: error.message });
  }
};

module.exports = { uploadDocument, getDocumentsByClaim };
