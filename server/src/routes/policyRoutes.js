const express = require("express");
const {
  createPolicy,
  getPolicies,
  getMyPolicy,
  getPolicyById,
  updatePolicy,
} = require("../controllers/policyController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", authorize("admin"), createPolicy);
router.get("/", authorize("admin", "officer"), getPolicies);
router.get("/my-policy", authorize("policyholder"), getMyPolicy);
router.get("/:id", authorize("admin", "officer", "policyholder"), getPolicyById);
router.put("/:id", authorize("admin"), updatePolicy);

module.exports = router;
