const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  checkIn,
  getTodayAttendance,
  getAttendanceHistory,
  getCalendarData,
  manualAttendance,
  getStudentsAttendanceStatus,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/check-in", authorize("student"), checkIn);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/calendar", getCalendarData);

// Master manual attendance routes
router.post("/manual", authorize("master"), manualAttendance);
router.get("/students-status", authorize("master"), getStudentsAttendanceStatus);

module.exports = router;
