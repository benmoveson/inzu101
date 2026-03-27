// server/src/routes/auth.js
const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  verify2FA, 
  verifyToken, 
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword
} = require("../controllers/authController");

// Authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.get("/verify", verifyToken);
router.get("/verify", verifyToken);

// Test route to verify server sees this file
router.get("/test", (req, res) => {
  res.json({ msg: "Auth route is working!" });
});

module.exports = router;
