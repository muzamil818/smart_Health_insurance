const mongoose = require("mongoose");

const approvalRecordSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    decision: {
      type: String,
      enum: ["approved", "rejected", "more_information_required"],
      required: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    decidedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ApprovalRecord", approvalRecordSchema);
