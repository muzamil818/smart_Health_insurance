const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    policyholderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverageLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    coveredTreatments: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Policy", policySchema);
