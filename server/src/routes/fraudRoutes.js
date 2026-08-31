const express = require("express");
const { FRAUD_RULES } = require("../services/fraudScoring");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin", "officer"));

router.get("/rules", (_req, res) => {
  res.json({
    rules: FRAUD_RULES,
    riskLevels: {
      low: "0-30",
      medium: "31-60",
      high: "61+",
    },
  });
});

module.exports = router;
