const User = require("../models/User");
const AppError = require("../utils/AppError");

// Get platform stats
exports.getStats = async (req, res, next) => {
  try {
    const totalMasters = await User.countDocuments({ role: "master" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const activeMasters = await User.countDocuments({ role: "master", status: "active" });
    const suspendedMasters = await User.countDocuments({ role: "master", status: "suspended" });

    const recentUsers = await User.find()
      .select("name email role createdAt status")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMasters,
          totalStudents,
          activeMasters,
          suspendedMasters,
          totalUsers: totalMasters + totalStudents,
        },
        recentUsers: recentUsers.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          initials: u.initials,
          createdAt: u.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all masters (admin)
exports.getAllMasters = async (req, res, next) => {
  try {
    const { search, sortBy = "createdAt", order = "desc", page = 1, limit = 50 } = req.query;

    const query = { role: "master" };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
      ];
    }

    const sortOptions = {};
    const validSortFields = ["name", "email", "createdAt", "status"];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [masters, total] = await Promise.all([
      User.find(query)
        .select("name email avatar bio subject status studentLimit registeredStudents createdAt")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: masters.length,
      total,
      data: {
        masters: masters.map((m) => ({
          id: m._id,
          name: m.name,
          email: m.email,
          avatar: m.avatar,
          initials: m.initials,
          bio: m.bio,
          subject: m.subject,
          status: m.status,
          studentLimit: m.studentLimit,
          studentCount: m.registeredStudents ? m.registeredStudents.length : 0,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all students (admin)
exports.getAllStudents = async (req, res, next) => {
  try {
    const { search, sortBy = "createdAt", order = "desc", page = 1, limit = 50 } = req.query;

    const query = { role: "student" };

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { country: searchRegex },
        { province: searchRegex },
      ];
    }

    const sortOptions = {};
    const validSortFields = ["name", "email", "createdAt", "country"];
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      User.find(query)
        .select("name email avatar bio country province registeredMasters createdAt")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      data: {
        students: students.map((s) => ({
          id: s._id,
          name: s.name,
          email: s.email,
          avatar: s.avatar,
          initials: s.initials,
          bio: s.bio,
          country: s.country,
          province: s.province,
          masterCount: s.registeredMasters ? s.registeredMasters.length : 0,
          createdAt: s.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update master status (suspend/activate)
exports.updateMasterStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const master = await User.findOneAndUpdate(
      { _id: req.params.id, role: "master" },
      { status },
      { new: true }
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
          status: master.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update master student limit
exports.updateMasterLimit = async (req, res, next) => {
  try {
    const { studentLimit } = req.body;
    if (!studentLimit || studentLimit < 1) {
      return next(new AppError("Invalid student limit", 400));
    }

    const master = await User.findOneAndUpdate(
      { _id: req.params.id, role: "master" },
      { studentLimit },
      { new: true }
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
          studentLimit: master.studentLimit,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete any user (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Clean up references
    if (user.role === "student") {
      await User.updateMany(
        { registeredStudents: user._id },
        { $pull: { registeredStudents: user._id } }
      );
    } else if (user.role === "master") {
      await User.updateMany(
        { registeredMasters: user._id },
        { $pull: { registeredMasters: user._id } }
      );
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
