const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "hospital"), getUsers);
router.post("/", authorize("admin"), createUser);
router.get("/:id", authorize("admin", "hospital"), getUserById);
router.put("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;
