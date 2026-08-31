const express = require("express");
const {
  createHospital,
  getHospitals,
  getHospitalById,
  updateHospital,
} = require("../controllers/hospitalController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", authorize("admin"), createHospital);
router.get("/", authorize("admin", "officer"), getHospitals);
router.get("/:id", authorize("admin", "officer"), getHospitalById);
router.put("/:id", authorize("admin"), updateHospital);

module.exports = router;
