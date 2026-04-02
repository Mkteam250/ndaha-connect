const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  generateQR,
  getActiveSession,
  deactivateSession,
  resetStudentQR,
} = require("../controllers/qrController");

router.use(protect);
router.use(authorize("master"));

router.post("/generate", generateQR);
router.get("/active", getActiveSession);
router.post("/deactivate", deactivateSession);
router.post("/reset/:studentId", resetStudentQR);

module.exports = router;
