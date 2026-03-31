const User = require("../models/User");
const AppError = require("../utils/AppError");

// Get all masters (for students to browse)
exports.getAllMasters = async (req, res, next) => {
  try {
    const masters = await User.find({ role: "master", status: "active" }).select(
      "name email avatar bio subject availability country province registeredStudents studentLimit createdAt"
    );

    const formatted = masters.map((m) => ({
      id: m._id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      initials: m.initials,
      bio: m.bio,
      subject: m.subject,
      availability: m.availability,
      country: m.country,
      province: m.province,
      studentCount: m.registeredStudents ? m.registeredStudents.length : 0,
      studentLimit: m.studentLimit,
      createdAt: m.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: { masters: formatted },
    });
  } catch (error) {
    next(error);
  }
};

// Get single master profile
exports.getMasterProfile = async (req, res, next) => {
  try {
    const master = await User.findOne({ _id: req.params.id, role: "master" }).select(
      "name email avatar bio subject availability country province district registeredStudents studentLimit createdAt"
    );

    if (!master) {
      return next(new AppError("Master not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        master: {
          id: master._id,
          name: master.name,
          email: master.email,
          avatar: master.avatar,
          initials: master.initials,
          bio: master.bio,
          subject: master.subject,
          availability: master.availability,
          country: master.country,
          province: master.province,
          district: master.district,
          studentCount: master.registeredStudents ? master.registeredStudents.length : 0,
          studentLimit: master.studentLimit,
          createdAt: master.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student registers under a master
exports.registerUnderMaster = async (req, res, next) => {
  try {
    const masterId = req.params.id;
    const studentId = req.user._id;

    const master = await User.findOne({ _id: masterId, role: "master", status: "active" });
    if (!master) {
      return next(new AppError("Master not found or inactive", 404));
    }

    if (master.registeredStudents.includes(studentId)) {
      return next(new AppError("You are already registered under this master", 400));
    }

    if (master.registeredStudents.length >= master.studentLimit) {
      return next(new AppError("This master has reached their student limit", 400));
    }

    // Add student to master's list
    master.registeredStudents.push(studentId);
    await master.save();

    // Add master to student's list
    const student = await User.findById(studentId);
    if (!student.registeredMasters.includes(masterId)) {
      student.registeredMasters.push(masterId);
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: `Successfully registered under ${master.name}`,
      data: {
        master: {
          id: master._id,
          name: master.name,
          subject: master.subject,
          initials: master.initials,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Student removes themselves from a master
exports.unregisterFromMaster = async (req, res, next) => {
  try {
    const masterId = req.params.id;
    const studentId = req.user._id;

    const master = await User.findById(masterId);
    if (!master) {
      return next(new AppError("Master not found", 404));
    }

    // Remove student from master's list
    master.registeredStudents = master.registeredStudents.filter(
      (id) => id.toString() !== studentId.toString()
    );
    await master.save();

    // Remove master from student's list
    const student = await User.findById(studentId);
    student.registeredMasters = student.registeredMasters.filter(
      (id) => id.toString() !== masterId.toString()
    );
    await student.save();

    res.status(200).json({
      success: true,
      message: `Unregistered from ${master.name}`,
    });
  } catch (error) {
    next(error);
  }
};

// Master gets their registered students
exports.getMyStudents = async (req, res, next) => {
  try {
    const master = await User.findById(req.user._id).populate(
      "registeredStudents",
      "name email avatar phone bio country province district registeredMasters createdAt initials"
    );

    if (!master) {
      return next(new AppError("Master not found", 404));
    }

    const students = master.registeredStudents.map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      initials: s.initials,
      phone: s.phone,
      bio: s.bio,
      country: s.country,
      province: s.province,
      district: s.district,
      masterCount: s.registeredMasters ? s.registeredMasters.length : 0,
      registeredAt: s.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: students.length,
      studentLimit: master.studentLimit,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

// Student gets their registered masters
exports.getMyMasters = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id).populate(
      "registeredMasters",
      "name email avatar bio subject availability country province registeredStudents studentLimit createdAt initials"
    );

    if (!student) {
      return next(new AppError("Student not found", 404));
    }

    const masters = student.registeredMasters.map((m) => ({
      id: m._id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      initials: m.initials,
      bio: m.bio,
      subject: m.subject,
      availability: m.availability,
      country: m.country,
      province: m.province,
      studentCount: m.registeredStudents ? m.registeredStudents.length : 0,
      studentLimit: m.studentLimit,
    }));

    res.status(200).json({
      success: true,
      count: masters.length,
      data: { masters },
    });
  } catch (error) {
    next(error);
  }
};

// Remove a student from master's list (master action)
exports.removeStudent = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const masterId = req.user._id;

    const master = await User.findById(masterId);
    if (!master) {
      return next(new AppError("Master not found", 404));
    }

    master.registeredStudents = master.registeredStudents.filter(
      (id) => id.toString() !== studentId
    );
    await master.save();

    const student = await User.findById(studentId);
    if (student) {
      student.registeredMasters = student.registeredMasters.filter(
        (id) => id.toString() !== masterId.toString()
      );
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: "Student removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
