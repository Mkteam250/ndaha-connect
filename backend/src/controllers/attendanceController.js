const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const User = require("../models/User");
const QRSession = require("../models/QRSession");
const AppError = require("../utils/AppError");

// Helper: Find or create a Student document for a User
async function getOrCreateStudent(userId, masterId) {
  // First try to find by userId
  let student = await Student.findOne({ userId });
  if (student) {
    if (!student.masterId && masterId) {
      student.masterId = masterId;
      await student.save();
    }
    return student;
  }

  // If not found by userId, try to find by email
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  student = await Student.findOne({ email: user.email });
  if (student) {
    // Update the userId link if missing
    if (!student.userId) {
      student.userId = user._id;
    }
    if (!student.masterId && masterId) {
      student.masterId = masterId;
    }
    await student.save();
    return student;
  }

  // Create new Student document
  const nameParts = user.name.split(" ");
  const firstName = nameParts[0] || "Student";
  const lastName = nameParts.slice(1).join(" ") || "-";
  student = await Student.create({
    firstName,
    lastName,
    email: user.email,
    phone: user.phone || "",
    country: user.country || "",
    province: user.province || "",
    userId: user._id,
    masterId: masterId,
  });
  return student;
}

// Helper: Calculate distance between two coordinates (Haversine formula) in meters
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Student QR check-in with optional location verification
exports.checkIn = async (req, res, next) => {
  try {
    const { qrCode, latitude, longitude } = req.body;

    if (!qrCode) {
      return next(new AppError("QR code is required", 400));
    }

    const session = await QRSession.findOne({ code: qrCode, isActive: true });

    if (!session) {
      return next(new AppError("Invalid or expired QR code", 400));
    }

    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      return next(new AppError("QR code has expired", 400));
    }

    // Location verification
    const master = await User.findById(session.masterId);
    if (master.locationEnabled && master.locationLat && master.locationLng) {
      if (!latitude || !longitude) {
        return next(new AppError("Location is required. Please enable location services.", 400));
      }
      const distance = getDistance(master.locationLat, master.locationLng, latitude, longitude);
      if (distance > 200) {
        return next(new AppError(`You are too far from the master (${Math.round(distance)}m away). You must be within 200m to check in.`, 400));
      }
    }

    // Find or create Student document for this user
    let student;
    try {
      student = await getOrCreateStudent(req.user._id, session.masterId);
    } catch (err) {
      return next(new AppError(err.message || "Could not create student profile", 500));
    }

    const today = new Date().toISOString().split("T")[0];
    const existing = await Attendance.findOne({ studentId: student._id, date: today });

    if (existing) {
      return next(new AppError("You have already checked in today", 400));
    }

    const now = new Date();
    const time = now.toTimeString().split(" ")[0].substring(0, 5);

    // Determine late threshold from master's setting
    const lateTime = master.lateTime || "09:00";
    const [lateHour, lateMin] = lateTime.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const lateThresholdMinutes = lateHour * 60 + lateMin;
    const status = currentMinutes >= lateThresholdMinutes ? "late" : "present";

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
      message: `Checked in as ${status}!`,
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

// Get today's attendance (both QR and manual)
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
      .populate({ path: "studentId", select: "firstName lastName userId", populate: { path: "userId", select: "avatar name" } })
      .sort({ time: -1 });

    const formatted = records.map((r) => {
      const stu = r.studentId;
      const user = stu?.userId;
      return {
        id: r._id,
        studentId: stu?._id,
        studentName: stu ? `${stu.firstName} ${stu.lastName}` : "Unknown",
        avatar: user?.avatar || (stu ? `${stu.firstName[0]}${stu.lastName[0]}`.toUpperCase() : "??"),
        time: r.time,
        date: r.date,
        status: r.status,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: { attendance: formatted },
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance history
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
      .populate({ path: "studentId", select: "firstName lastName userId", populate: { path: "userId", select: "avatar" } })
      .sort({ date: -1, time: -1 });

    const formatted = records.map((r) => {
      const stu = r.studentId;
      const user = stu?.userId;
      return {
        id: r._id,
        studentId: stu?._id,
        studentName: stu ? `${stu.firstName} ${stu.lastName}` : "Unknown",
        avatar: user?.avatar || (stu ? `${stu.firstName[0]}${stu.lastName[0]}`.toUpperCase() : "??"),
        time: r.time,
        date: r.date,
        status: r.status,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: { attendance: formatted },
    });
  } catch (error) {
    next(error);
  }
};

// Get calendar data
exports.getCalendarData = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const masterId = req.user.role === "master" ? req.user._id : null;

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

    const filter = { date: { $gte: startDate, $lte: endDate } };
    if (masterId) filter.masterId = masterId;

    const records = await Attendance.find(filter)
      .populate({ path: "studentId", select: "firstName lastName userId", populate: { path: "userId", select: "avatar" } });

    const calendarData = {};

    // Count registered students (from User model)
    const master = masterId ? await User.findById(masterId) : null;
    const totalStudents = master ? (master.registeredStudents?.length || 0) : await User.countDocuments({ role: "student" });

    records.forEach((r) => {
      const stu = r.studentId;
      const user = stu?.userId;
      if (!calendarData[r.date]) {
        calendarData[r.date] = { attended: 0, total: totalStudents || 1, records: [] };
      }
      calendarData[r.date].attended++;
      calendarData[r.date].records.push({
        id: r._id,
        studentId: stu?._id,
        studentName: stu ? `${stu.firstName} ${stu.lastName}` : "Unknown",
        avatar: user?.avatar || (stu ? `${stu.firstName[0]}${stu.lastName[0]}`.toUpperCase() : "??"),
        time: r.time,
        date: r.date,
        status: r.status,
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

    // Verify the student is registered under this master (check User model)
    const master = await User.findById(masterId);
    if (!master.registeredStudents.includes(studentId)) {
      return next(new AppError("Student is not registered under you", 403));
    }

    // Find or create Student document for this user
    const student = await getOrCreateStudent(studentId, masterId);

    const today = new Date().toISOString().split("T")[0];
    const existing = await Attendance.findOne({ studentId: student._id, masterId, date: today });

    if (existing) {
      existing.status = status;
      existing.time = new Date().toTimeString().split(" ")[0].substring(0, 5);
      await existing.save();

      const user = await User.findById(studentId);
      return res.status(200).json({
        success: true,
        message: `Attendance updated for ${user?.name || "student"}`,
        data: { attendance: { id: existing._id, status: existing.status, date: existing.date, time: existing.time } },
      });
    }

    const now = new Date();
    const time = now.toTimeString().split(" ")[0].substring(0, 5);

    const attendance = await Attendance.create({
      studentId: student._id,
      masterId,
      qrSessionId: null,
      date: today,
      time,
      status,
    });

    const user = await User.findById(studentId);

    res.status(201).json({
      success: true,
      message: `${user?.name || "Student"} marked as ${status}`,
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

    // Get today's attendance records
    const todayRecords = await Attendance.find({ masterId, date: today });

    // Build a map: userId -> attendance status
    const attendanceByUserId = {};

    for (const r of todayRecords) {
      // Find which user this Student document belongs to
      const studentDoc = await Student.findById(r.studentId);
      if (studentDoc) {
        attendanceByUserId[studentDoc.userId.toString()] = { status: r.status, time: r.time, id: r._id };
      }
    }

    const students = (master.registeredStudents || []).map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      initials: s.initials,
      country: s.country,
      province: s.province,
      todayStatus: attendanceByUserId[s._id.toString()] || null,
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

// Master updates their location for location-based check-in
exports.updateMasterLocation = async (req, res, next) => {
  try {
    const { latitude, longitude, locationEnabled } = req.body;
    const masterId = req.user._id;

    const updates = {};
    if (typeof locationEnabled === "boolean") {
      updates.locationEnabled = locationEnabled;
    }
    if (latitude && longitude) {
      updates.locationLat = latitude;
      updates.locationLng = longitude;
      updates.locationUpdatedAt = new Date();
    }

    const master = await User.findByIdAndUpdate(masterId, updates, { new: true });

    res.status(200).json({
      success: true,
      message: locationEnabled ? "Location check enabled" : "Location check disabled",
      data: {
        locationEnabled: master.locationEnabled,
        locationLat: master.locationLat,
        locationLng: master.locationLng,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get master's current location settings
exports.getMasterLocation = async (req, res, next) => {
  try {
    const master = await User.findById(req.user._id).select("locationEnabled locationLat locationLng locationUpdatedAt");

    res.status(200).json({
      success: true,
      data: {
        locationEnabled: master.locationEnabled || false,
        locationLat: master.locationLat,
        locationLng: master.locationLng,
        locationUpdatedAt: master.locationUpdatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get master's late time setting
exports.getLateTime = async (req, res, next) => {
  try {
    const master = await User.findById(req.user._id).select("lateTime");

    res.status(200).json({
      success: true,
      data: {
        lateTime: master.lateTime || "09:00",
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update master's late time setting
exports.updateLateTime = async (req, res, next) => {
  try {
    const { lateTime } = req.body;
    const masterId = req.user._id;

    if (!lateTime || !/^\d{2}:\d{2}$/.test(lateTime)) {
      return next(new AppError("Invalid late time format. Use HH:MM (e.g. 09:00)", 400));
    }

    const master = await User.findByIdAndUpdate(masterId, { lateTime }, { new: true });

    res.status(200).json({
      success: true,
      message: `Late time updated to ${lateTime}`,
      data: {
        lateTime: master.lateTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an attendance record (so student can scan again)
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const masterId = req.user._id;

    const record = await Attendance.findOne({ _id: id, masterId });
    if (!record) {
      return next(new AppError("Attendance record not found", 404));
    }

    await Attendance.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Attendance record deleted. Student can check in again.",
    });
  } catch (error) {
    next(error);
  }
};
