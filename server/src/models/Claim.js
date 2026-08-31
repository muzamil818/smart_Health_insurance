const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    policyholderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    treatment: {
      type: String,
      required: true,
      trim: true,
    },
    treatmentDate: {
      type: Date,
      required: true,
    },
    claimAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "more_information_required",
      ],
      default: "pending",
    },
    validationResults: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);
