const mongoose = require("mongoose");

const claimDocumentSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    documentType: {
      type: String,
      enum: [
        "medical report",
        "prescription",
        "hospital bill",
        "treatment record",
        "other",
      ],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClaimDocument", claimDocumentSchema);
