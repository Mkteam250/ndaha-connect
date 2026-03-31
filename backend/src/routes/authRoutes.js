const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  registerValidation,
  loginValidation,
} = require("../controllers/authController");

const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
