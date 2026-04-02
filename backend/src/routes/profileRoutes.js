const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  updateProfile,
  getProfile,
  getUserProfile,
  uploadAvatar,
  updateUserAvatar,
} = require("../controllers/profileController");

router.use(protect);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.post("/avatar", uploadAvatar);
router.put("/:id/avatar", updateUserAvatar);
router.get("/:id", getUserProfile);

module.exports = router;
