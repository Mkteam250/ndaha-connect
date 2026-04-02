const Student = require("../models/Student");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

exports.getMasterDashboard = async (req, res, next) => {
  try {
    const masterId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    // Get master with registered students
    const master = await User.findById(masterId);
    const totalStudents = master?.registeredStudents?.length || 0;

    const todayRecords = await Attendance.find({ masterId, date: today });
    const presentToday = todayRecords.filter((r) => r.status === "present" || r.status === "late").length;
    const absentToday = todayRecords.filter((r) => r.status === "absent").length;
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

    // Top students by attendance - use registered students from User model
    const registeredStudentIds = master?.registeredStudents || [];
    const registeredUsers = await User.find({ _id: { $in: registeredStudentIds } }).select("name avatar initials");
    const allAttendance = await Attendance.find({ masterId });

    // Build a map of userId -> student document IDs to match attendance records
    const students = await Student.find({ userId: { $in: registeredStudentIds } });
    const userIdToStudentId = {};
    students.forEach((s) => { userIdToStudentId[s.userId.toString()] = s._id.toString(); });

    const studentAttendance = {};
    allAttendance.forEach((r) => {
      const sid = r.studentId.toString();
      if (!studentAttendance[sid]) studentAttendance[sid] = 0;
      studentAttendance[sid]++;
    });

    const uniqueDates = [...new Set(allAttendance.map((r) => r.date))];
    const totalSessions = uniqueDates.length || 1;

    const topStudents = registeredUsers
      .map((u) => {
        const studentId = userIdToStudentId[u._id.toString()];
        const count = studentId ? (studentAttendance[studentId] || 0) : 0;
        return {
          id: u._id,
          name: u.name,
          initials: u.initials,
          avatar: u.avatar || "",
          attendanceRate: Math.round((count / totalSessions) * 100),
        };
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 5);

    // Recent activity
    const recentRecords = await Attendance.find({ masterId })
      .populate({ path: "studentId", select: "firstName lastName userId", populate: { path: "userId", select: "name" } })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentActivity = recentRecords.map((r) => {
      const stu = r.studentId;
      const userName = stu?.userId?.name || (stu ? `${stu.firstName} ${stu.lastName}` : "Student");
      return {
        id: r._id,
        message: `${userName} checked in`,
        timestamp: `${r.date} ${r.time}`,
        type: "attendance",
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          presentToday,
          absentToday: Math.max(0, totalStudents - presentToday),
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
    const student = await Student.findOne({ userId: req.user._id }).populate("masterId", "name email avatar");
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
          masterAvatar: student.masterId?.avatar || "",
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

    // Get registered students from User model
    let studentUsers;
    if (masterId) {
      const master = await User.findById(masterId);
      const registeredIds = master?.registeredStudents || [];
      studentUsers = await User.find({ _id: { $in: registeredIds } }).select("name avatar initials");
    } else {
      studentUsers = await User.find({ role: "student" }).select("name avatar initials");
    }

    const allAttendance = masterId
      ? await Attendance.find({ masterId })
      : await Attendance.find();

    const uniqueDates = [...new Set(allAttendance.map((r) => r.date))];
    const totalSessions = uniqueDates.length || 1;

    // Build userId -> studentDocId map
    const userIds = studentUsers.map((u) => u._id);
    const studentDocs = await Student.find({ userId: { $in: userIds } });
    const userIdToStudentId = {};
    studentDocs.forEach((s) => { userIdToStudentId[s.userId.toString()] = s._id.toString(); });

    const studentAttendance = {};
    allAttendance.forEach((r) => {
      const sid = r.studentId.toString();
      if (!studentAttendance[sid]) studentAttendance[sid] = { present: 0, late: 0 };
      if (r.status === "present") studentAttendance[sid].present++;
      if (r.status === "late") studentAttendance[sid].late++;
    });

    const report = studentUsers.map((u) => {
      const studentId = userIdToStudentId[u._id.toString()];
      const data = studentId ? (studentAttendance[studentId] || { present: 0, late: 0 }) : { present: 0, late: 0 };
      const totalPresent = data.present + data.late;
      return {
        id: u._id,
        name: u.name,
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
