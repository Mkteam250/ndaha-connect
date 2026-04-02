const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const User = require("../models/User");
const AppError = require("../utils/AppError");

exports.checkIn = async (req, res, next) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return next(new AppError("QR code is required", 400));
    }

    const QRSession = require("../models/QRSession");
    const session = await QRSession.findOne({ code: qrCode, isActive: true });

    if (!session) {
      return next(new AppError("Invalid or expired QR code", 400));
    }

    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      return next(new AppError("QR code has expired", 400));
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return next(new AppError("Student profile not found", 404));
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = await Attendance.findOne({ studentId: student._id, date: today });

    if (existing) {
      return next(new AppError("You have already checked in today", 400));
    }

    const now = new Date();
    const time = now.toTimeString().split(" ")[0].substring(0, 5);
    const hour = now.getHours();
    const status = hour >= 9 ? "late" : "present";

    const attendance = await Attendance.create({
      studentId: student._id,
      masterId: session.masterId,
      qrSessionId: session._id,
      date: today,
      time,
      status,
    });

    session.isActive = false;
    await session.save();

    res.status(201).json({
      success: true,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const filter = { date: today };

    if (req.user.role === "master") {
      filter.masterId = req.user._id;
    } else if (req.user.role === "student") {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        filter.studentId = student._id;
      }
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "firstName lastName")
      .sort({ time: -1 });

    const formatted = records.map((r) => ({
      id: r._id,
      studentId: r.studentId?._id,
      studentName: r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "Unknown",
      avatar: r.studentId ? `${r.studentId.firstName[0]}${r.studentId.lastName[0]}`.toUpperCase() : "??",
      time: r.time,
      date: r.date,
      status: r.status,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: { attendance: formatted },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, studentId } = req.query;
    const filter = {};

    if (req.user.role === "master") {
      filter.masterId = req.user._id;
    } else if (req.user.role === "student") {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) filter.studentId = student._id;
    }

    if (studentId) filter.studentId = studentId;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "firstName lastName")
      .sort({ date: -1, time: -1 });

    const formatted = records.map((r) => ({
      id: r._id,
      studentId: r.studentId?._id,
      studentName: r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "Unknown",
      avatar: r.studentId ? `${r.studentId.firstName[0]}${r.studentId.lastName[0]}`.toUpperCase() : "??",
      time: r.time,
      date: r.date,
      status: r.status,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: { attendance: formatted },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCalendarData = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const masterId = req.user.role === "master" ? req.user._id : null;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (masterId) filter.masterId = masterId;

    const records = await Attendance.find(filter).populate("studentId", "firstName lastName");

    const calendarData = {};
    const totalStudents = masterId
      ? await Student.countDocuments({ masterId })
      : await Student.countDocuments();

    records.forEach((r) => {
      if (!calendarData[r.date]) {
        calendarData[r.date] = { attended: 0, total: totalStudents || 1, records: [] };
      }
      calendarData[r.date].attended++;
      calendarData[r.date].records.push({
        id: r._id,
        studentId: r.studentId?._id,
        studentName: r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "Unknown",
        avatar: r.studentId ? `${r.studentId.firstName[0]}${r.studentId.lastName[0]}`.toUpperCase() : "??",
        time: r.time,
        date: r.date,
      });
    });

    res.status(200).json({
      success: true,
      data: { calendarData },
    });
  } catch (error) {
    next(error);
  }
};

// Manual attendance marking by master
exports.manualAttendance = async (req, res, next) => {
  try {
    const masterId = req.user._id;
    const { studentId, status = "present" } = req.body;

    if (!studentId) {
      return next(new AppError("Student ID is required", 400));
    }

    if (!["present", "late", "absent"].includes(status)) {
      return next(new AppError("Invalid status. Use present, late, or absent.", 400));
    }

    // Verify the student is registered under this master
    const master = await User.findById(masterId);
    if (!master.registeredStudents.includes(studentId)) {
      return next(new AppError("Student is not registered under you", 403));
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = await Attendance.findOne({ studentId, masterId, date: today });

    if (existing) {
      // Update existing record
      existing.status = status;
      existing.time = new Date().toTimeString().split(" ")[0].substring(0, 5);
      await existing.save();

      const student = await User.findById(studentId);
      return res.status(200).json({
        success: true,
        message: `Attendance updated for ${student?.name || "student"}`,
        data: { attendance: { id: existing._id, status: existing.status, date: existing.date, time: existing.time } },
      });
    }

    const now = new Date();
    const time = now.toTimeString().split(" ")[0].substring(0, 5);

    const attendance = await Attendance.create({
      studentId,
      masterId,
      qrSessionId: null,
      date: today,
      time,
      status,
    });

    const student = await User.findById(studentId);

    res.status(201).json({
      success: true,
      message: `${student?.name || "Student"} marked as ${status}`,
      data: { attendance: { id: attendance._id, status: attendance.status, date: attendance.date, time: attendance.time } },
    });
  } catch (error) {
    next(error);
  }
};

// Get master's registered students with today's attendance status
exports.getStudentsAttendanceStatus = async (req, res, next) => {
  try {
    const masterId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    const master = await User.findById(masterId).populate(
      "registeredStudents",
      "name email avatar country province initials"
    );

    if (!master) {
      return next(new AppError("Master not found", 404));
    }

    const todayRecords = await Attendance.find({ masterId, date: today });
    const attendanceMap = {};
    todayRecords.forEach((r) => {
      attendanceMap[r.studentId.toString()] = { status: r.status, time: r.time, id: r._id };
    });

    const students = (master.registeredStudents || []).map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      initials: s.initials,
      country: s.country,
      province: s.province,
      todayStatus: attendanceMap[s._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      count: students.length,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};
