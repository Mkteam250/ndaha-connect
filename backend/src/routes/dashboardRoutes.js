const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getMasterDashboard,
  getStudentDashboard,
  getReports,
} = require("../controllers/dashboardController");

router.use(protect);

router.get("/master", authorize("master"), getMasterDashboard);
router.get("/student", authorize("student"), getStudentDashboard);
router.get("/reports", getReports);

module.exports = router;
