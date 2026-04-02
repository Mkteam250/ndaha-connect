const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["master", "student", "admin"],
      default: "student",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    subject: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    province: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    studentLimit: {
      type: Number,
      default: 5,
    },
    registeredMasters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    locationEnabled: {
      type: Boolean,
      default: false,
    },
    locationLat: {
      type: Number,
      default: null,
    },
    locationLng: {
      type: Number,
      default: null,
    },
    locationUpdatedAt: {
      type: Date,
      default: null,
    },
    lateTime: {
      type: String,
      default: "09:00",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("initials").get(function () {
  if (!this.name) return "??";
  return this.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

userSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    phone: this.phone,
    bio: this.bio,
    subject: this.subject,
    availability: this.availability,
    country: this.country,
    province: this.province,
    district: this.district,
    initials: this.initials,
    studentLimit: this.studentLimit,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
