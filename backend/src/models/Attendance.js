const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    masterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QRSession",
      default: null,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "late", "absent"],
      default: "present",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ masterId: 1, date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
