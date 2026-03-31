const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getAllMasters,
  getMasterProfile,
  registerUnderMaster,
  unregisterFromMaster,
  getMyStudents,
  getMyMasters,
  removeStudent,
} = require("../controllers/masterController");

// Public - browse masters (also used by students)
router.get("/", protect, getAllMasters);

// Student routes
router.get("/my-masters", protect, authorize("student"), getMyMasters);
router.post("/:id/register", protect, authorize("student"), registerUnderMaster);
router.delete("/:id/unregister", protect, authorize("student"), unregisterFromMaster);

// Master routes
router.get("/my-students", protect, authorize("master"), getMyStudents);
router.delete("/students/:studentId", protect, authorize("master"), removeStudent);

// Get single master profile
router.get("/:id", protect, getMasterProfile);

module.exports = router;
