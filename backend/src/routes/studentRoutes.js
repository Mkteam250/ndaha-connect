const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getStudents,
  getStudent,
  getMyProfile,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");

router.use(protect);

router.get("/me/profile", authorize("student"), getMyProfile);
router.get("/", getStudents);
router.get("/:id", getStudent);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
