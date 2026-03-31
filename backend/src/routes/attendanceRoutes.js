const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  checkIn,
  getTodayAttendance,
  getAttendanceHistory,
  getCalendarData,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/check-in", authorize("student"), checkIn);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/calendar", getCalendarData);

module.exports = router;
