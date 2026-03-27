const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createInquiry,
  getUserInquiries,
  getInquiryById,
  updateInquiryStatus,
} = require("../controllers/inquiryController");

// All routes require authentication
router.use(auth);

// POST /api/inquiries - Create new inquiry
router.post("/", createInquiry);

// GET /api/inquiries - Get user's inquiry history
router.get("/", getUserInquiries);

// GET /api/inquiries/:id - Get specific inquiry
router.get("/:id", getInquiryById);

// PUT /api/inquiries/:id - Update inquiry status
router.put("/:id", updateInquiryStatus);

module.exports = router;
