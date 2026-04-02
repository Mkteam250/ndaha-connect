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
  updateMasterLocation,
  getMasterLocation,
} = require("../controllers/attendanceController");

router.use(protect);

router.post("/check-in", authorize("student"), checkIn);
router.get("/today", getTodayAttendance);
router.get("/history", getAttendanceHistory);
router.get("/calendar", getCalendarData);

// Master manual attendance routes
router.post("/manual", authorize("master"), manualAttendance);
router.get("/students-status", authorize("master"), getStudentsAttendanceStatus);

// Location-based check-in routes
router.get("/location", authorize("master"), getMasterLocation);
router.put("/location", authorize("master"), updateMasterLocation);

module.exports = router;
