const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

exports.getMasterDashboard = async (req, res, next) => {
  try {
    const masterId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    const totalStudents = await Student.countDocuments({ masterId, status: "active" });
    const todayRecords = await Attendance.find({ masterId, date: today });
    const presentToday = todayRecords.length;
    const absentToday = totalStudents - presentToday;
    const rate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    // Last 30 days trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split("T")[0];

    const trendRecords = await Attendance.find({
      masterId,
      date: { $gte: startDate },
    });

    const trendMap = {};
    trendRecords.forEach((r) => {
      if (!trendMap[r.date]) trendMap[r.date] = 0;
      trendMap[r.date]++;
    });

    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const present = trendMap[key] || 0;
      trend.push({
        date: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        present,
        total: totalStudents || 1,
        rate: totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0,
      });
    }

    // Top students by attendance
    const students = await Student.find({ masterId, status: "active" });
    const allAttendance = await Attendance.find({ masterId });

    const studentAttendance = {};
    allAttendance.forEach((r) => {
      const sid = r.studentId.toString();
      if (!studentAttendance[sid]) studentAttendance[sid] = 0;
      studentAttendance[sid]++;
    });

    // Count unique dates for total sessions
    const uniqueDates = [...new Set(allAttendance.map((r) => r.date))];
    const totalSessions = uniqueDates.length || 1;

    const topStudents = students
      .map((s) => ({
        id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        initials: `${s.firstName[0]}${s.lastName[0]}`.toUpperCase(),
        attendanceRate: Math.round(((studentAttendance[s._id.toString()] || 0) / totalSessions) * 100),
      }))
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 5);

    // Recent activity
    const recentRecords = await Attendance.find({ masterId })
      .populate("studentId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivity = recentRecords.map((r) => ({
      id: r._id,
      message: `${r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "Student"} checked in`,
      timestamp: `${r.date} ${r.time}`,
      type: "attendance",
    }));

    // Add recent student registrations
    const recentStudents = await Student.find({ masterId })
      .sort({ createdAt: -1 })
      .limit(5);

    recentStudents.forEach((s) => {
      recentActivity.push({
        id: `reg-${s._id}`,
        message: `New student registered: ${s.firstName} ${s.lastName}`,
        timestamp: s.createdAt.toISOString().split("T")[0],
        type: "registration",
      });
    });

    recentActivity.sort((a, b) => {
      if (a.timestamp > b.timestamp) return -1;
      if (a.timestamp < b.timestamp) return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          presentToday,
          absentToday,
          rate,
          totalSessions,
        },
        trend,
        topStudents,
        recentActivity: recentActivity.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate("masterId", "name email");
    if (!student) {
      return res.status(200).json({
        success: true,
        data: { profile: null, stats: null },
      });
    }

    const allAttendance = await Attendance.find({ studentId: student._id });
    const attendedSessions = allAttendance.filter((a) => a.status !== "absent").length;

    const uniqueDates = await Attendance.distinct("date", { masterId: student.masterId?._id });
    const totalSessions = uniqueDates.length || 1;

    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = await Attendance.findOne({ studentId: student._id, date: today });

    // Last 7 days attendance
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRecords = allAttendance.filter((r) => r.date >= weekAgo.toISOString().split("T")[0]);

    res.status(200).json({
      success: true,
      data: {
        profile: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phone: student.phone,
          country: student.country,
          province: student.province,
          district: student.district,
          sector: student.sector,
          cell: student.cell,
          address: student.address,
          initials: `${student.firstName[0]}${student.lastName[0]}`.toUpperCase(),
          masterName: student.masterId?.name || "No master assigned",
          masterId: student.masterId?._id,
          enrolledDate: student.enrolledDate,
        },
        stats: {
          attendedSessions,
          totalSessions,
          attendanceRate: Math.round((attendedSessions / totalSessions) * 100),
          checkedInToday: !!todayAttendance,
          weekAttendance: weekRecords.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const masterId = req.user.role === "master" ? req.user._id : null;
    const students = masterId
      ? await Student.find({ masterId, status: "active" })
      : await Student.find({ status: "active" });

    const allAttendance = masterId
      ? await Attendance.find({ masterId })
      : await Attendance.find();

    const uniqueDates = [...new Set(allAttendance.map((r) => r.date))];
    const totalSessions = uniqueDates.length || 1;

    const studentAttendance = {};
    allAttendance.forEach((r) => {
      const sid = r.studentId.toString();
      if (!studentAttendance[sid]) studentAttendance[sid] = { present: 0, late: 0 };
      if (r.status === "present") studentAttendance[sid].present++;
      if (r.status === "late") studentAttendance[sid].late++;
    });

    const report = students.map((s) => {
      const data = studentAttendance[s._id.toString()] || { present: 0, late: 0 };
      const totalPresent = data.present + data.late;
      return {
        id: s._id,
        name: `${s.firstName} ${s.lastName}`,
        present: totalPresent,
        absent: totalSessions - totalPresent,
        rate: Math.round((totalPresent / totalSessions) * 100),
      };
    });

    const avgRate = report.length > 0
      ? Math.round(report.reduce((a, b) => a + b.rate, 0) / report.length)
      : 0;
    const bestStudent = report.length > 0 ? [...report].sort((a, b) => b.rate - a.rate)[0] : null;
    const worstStudent = report.length > 0 ? [...report].sort((a, b) => a.rate - b.rate)[0] : null;

    res.status(200).json({
      success: true,
      data: {
        totalSessions,
        avgRate,
        bestStudent: bestStudent?.name || "N/A",
        worstStudent: worstStudent?.name || "N/A",
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};
