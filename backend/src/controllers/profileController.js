const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const AVATARS_DIR = path.join(__dirname, "../../uploads/avatars");

// Ensure avatars directory exists
if (!fs.existsSync(AVATARS_DIR)) {
  fs.mkdirSync(AVATARS_DIR, { recursive: true });
}

// Save base64 image to disk, return the URL path
function saveAvatarToDisk(base64Data, userId) {
  const matches = base64Data.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image format");
  }

  const ext = matches[1] === "jpg" ? "jpeg" : matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");
  const filename = `${userId}-${Date.now()}.${ext}`;
  const filepath = path.join(AVATARS_DIR, filename);

  fs.writeFileSync(filepath, buffer);

  return `/uploads/avatars/${filename}`;
}

// Upload own avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return next(new AppError("No avatar data provided", 400));
    }

    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (!base64Regex.test(avatar)) {
      return next(new AppError("Invalid image format. Use PNG, JPEG, GIF, or WebP.", 400));
    }

    const sizeInBytes = Math.ceil((avatar.length * 3) / 4);
    if (sizeInBytes > 5 * 1024 * 1024) {
      return next(new AppError("Image too large. Maximum size is 5MB.", 400));
    }

    // Delete old avatar file if it exists
    const currentUser = await User.findById(req.user._id);
    if (currentUser.avatar && currentUser.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "../../", currentUser.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = saveAvatarToDisk(avatar, req.user._id);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// Update another user's avatar (master can update student avatars)
exports.updateUserAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    const targetUserId = req.params.id;

    if (!avatar) {
      return next(new AppError("No avatar data provided", 400));
    }

    const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
    if (!base64Regex.test(avatar)) {
      return next(new AppError("Invalid image format. Use PNG, JPEG, GIF, or WebP.", 400));
    }

    const sizeInBytes = Math.ceil((avatar.length * 3) / 4);
    if (sizeInBytes > 5 * 1024 * 1024) {
      return next(new AppError("Image too large. Maximum size is 5MB.", 400));
    }

    // Master can only update avatars of their registered students
    if (req.user.role === "master") {
      const master = await User.findById(req.user._id);
      if (!master.registeredStudents.includes(targetUserId)) {
        return next(new AppError("You can only update avatars of your registered students", 403));
      }
    }

    // Delete old avatar file if it exists
    const targetUser = await User.findById(targetUserId);
    if (targetUser && targetUser.avatar && targetUser.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "../../", targetUser.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarUrl = saveAvatarToDisk(avatar, targetUserId);

    const user = await User.findByIdAndUpdate(
      targetUserId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: { avatar: user.avatar },
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name", "phone", "bio", "subject",
      "availability", "country", "province", "district",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle avatar upload via base64
    if (req.body.avatar && req.body.avatar.startsWith("data:image")) {
      const sizeInBytes = Math.ceil((req.body.avatar.length * 3) / 4);
      if (sizeInBytes > 5 * 1024 * 1024) {
        return next(new AppError("Image too large. Maximum size is 5MB.", 400));
      }

      // Delete old avatar
      const currentUser = await User.findById(req.user._id);
      if (currentUser.avatar && currentUser.avatar.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "../../", currentUser.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updates.avatar = saveAvatarToDisk(req.body.avatar, req.user._id);
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
