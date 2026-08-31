const express = require("express");
const {
  uploadDocument,
  getDocumentsByClaim,
} = require("../controllers/documentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  authorize("hospital"),
  upload.single("file"),
  uploadDocument
);
router.get(
  "/:claimId",
  authorize("hospital", "officer", "admin", "policyholder"),
  getDocumentsByClaim
);

module.exports = router;
