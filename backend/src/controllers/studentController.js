const Student = require("../models/Student");
const User = require("../models/User");
const AppError = require("../utils/AppError");

exports.getStudents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "master") {
      filter.masterId = req.user._id;
    } else if (req.user.role === "student") {
      filter.userId = req.user._id;
    }

    const students = await Student.find(filter)
      .populate("masterId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: { students },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("masterId", "name email");

    if (!student) {
      return next(new AppError("Student not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate("masterId", "name email");

    if (!student) {
      return next(new AppError("Student profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, country, province, district, sector, cell, address } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return next(new AppError("A student with this email already exists", 400));
    }

    const studentData = {
      firstName,
      lastName,
      email,
      phone: phone || "",
      country: country || "",
      province: province || "",
      district: district || "",
      sector: sector || "",
      cell: cell || "",
      address: address || "",
    };

    if (req.user.role === "master") {
      const myStudentCount = await Student.countDocuments({ masterId: req.user._id });
      const limit = req.user.studentLimit || 5;
      if (myStudentCount >= limit) {
        return next(new AppError(`Student limit of ${limit} reached. Contact admin to increase.`, 400));
      }
      studentData.masterId = req.user._id;
    }

    if (req.user.role === "student") {
      studentData.userId = req.user._id;
      // Find a master to assign to (for now, assign to first available master)
      const master = await User.findOne({ role: "master" });
      if (master) {
        studentData.masterId = master._id;
      }
    }

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      data: { student },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(new AppError("Student not found", 404));
    }

    const allowedFields = ["firstName", "lastName", "email", "phone", "country", "province", "district", "sector", "cell", "address"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("masterId", "name email");

    res.status(200).json({
      success: true,
      data: { student: updated },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(new AppError("Student not found", 404));
    }

    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Student removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
