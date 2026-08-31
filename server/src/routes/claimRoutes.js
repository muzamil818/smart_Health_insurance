const express = require("express");
const {
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
} = require("../controllers/claimController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", authorize("hospital"), createClaim);
router.get("/", authorize("admin", "officer", "hospital"), getClaims);
router.get("/my-claims", authorize("policyholder"), getMyClaims);
router.get("/:id", getClaimById);
router.put("/:id", authorize("hospital", "admin"), updateClaim);

router.put("/:id/approve", authorize("officer"), approveClaim);
router.put("/:id/reject", authorize("officer"), rejectClaim);
router.put("/:id/request-information", authorize("officer"), requestInformation);

router.get("/:id/fraud-score", authorize("officer", "admin"), getFraudScore);
router.post(
  "/:id/calculate-fraud-score",
  authorize("officer", "admin"),
  recalculateFraudScore
);

module.exports = router;
