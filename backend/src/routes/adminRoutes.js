const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getStats,
  getAllMasters,
  getAllStudents,
  updateMasterStatus,
  updateMasterLimit,
  deleteUser,
} = require("../controllers/adminController");

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getStats);
router.get("/masters", getAllMasters);
router.get("/students", getAllStudents);
router.put("/masters/:id/status", updateMasterStatus);
router.put("/masters/:id/limit", updateMasterLimit);
router.delete("/users/:id", deleteUser);

module.exports = router;
