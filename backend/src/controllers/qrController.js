const QRSession = require("../models/QRSession");
const crypto = require("crypto");

exports.generateQR = async (req, res, next) => {
  try {
    // Deactivate any existing active sessions for this master
    await QRSession.updateMany(
      { masterId: req.user._id, isActive: true },
      { isActive: false }
    );

    const code = `NDAHA-${req.user._id.toString().slice(-6)}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = await QRSession.create({
      masterId: req.user._id,
      code,
      expiresAt,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: {
        session: {
          id: session._id,
          code: session.code,
          expiresAt: session.expiresAt,
          isActive: session.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getActiveSession = async (req, res, next) => {
  try {
    const session = await QRSession.findOne({
      masterId: req.user._id,
      isActive: true,
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(200).json({
        success: true,
        data: { session: null },
      });
    }

    if (new Date() > session.expiresAt) {
      session.isActive = false;
      await session.save();
      return res.status(200).json({
        success: true,
        data: { session: null },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        session: {
          id: session._id,
          code: session.code,
          expiresAt: session.expiresAt,
          isActive: session.isActive,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deactivateSession = async (req, res, next) => {
  try {
    await QRSession.updateMany(
      { masterId: req.user._id, isActive: true },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: "QR session deactivated",
    });
  } catch (error) {
    next(error);
  }
};
