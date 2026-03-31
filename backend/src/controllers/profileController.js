const User = require("../models/User");
const AppError = require("../utils/AppError");

// Update current user's profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name", "avatar", "phone", "bio", "subject",
      "availability", "country", "province", "district",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { user: user.toProfileJSON() },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's full profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("registeredMasters", "name email avatar subject initials")
      .populate("registeredStudents", "name email avatar initials");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const profile = user.toProfileJSON();
    profile.registeredMasters = user.registeredMasters.map((m) => ({
      id: m._id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      subject: m.subject,
      initials: m.initials,
    }));
    profile.registeredStudents = user.registeredStudents.map((s) => ({
      id: s._id,
      name: s.name,
      email: s.email,
      avatar: s.avatar,
      initials: s.initials,
    }));

    res.status(200).json({
      success: true,
      data: { user: profile },
    });
  } catch (error) {
    next(error);
  }
};

// Get any user's public profile by ID
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email avatar bio subject availability country province district role createdAt"
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          initials: user.initials,
          bio: user.bio,
          subject: user.subject,
          availability: user.availability,
          country: user.country,
          province: user.province,
          district: user.district,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
