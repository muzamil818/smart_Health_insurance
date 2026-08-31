const express = require("express");
const {
  getReports,
  getFraudRules,
  getAuditLogs,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/reports", getReports);
router.get("/fraud-rules", getFraudRules);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
