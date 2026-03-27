const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const { 
    sendVerificationCode, 
    verifyCode, 
    updateAvatar, 
    changePassword, 
    toggleTwoFactor,
    getProfile,
    updateProfile,
    updatePassword,
    deleteAccount,
    removeAvatar
} = require("../controllers/userController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Profile endpoints
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.patch("/profile", auth, updateProfile); // Support both PUT and PATCH

// Password endpoint
router.put("/password", auth, updatePassword);

// Account deletion endpoint
router.delete("/account", auth, deleteAccount);

// Avatar endpoints
router.patch("/avatar", auth, upload.single("avatar"), updateAvatar);
router.delete("/avatar", auth, removeAvatar);

// Other endpoints
router.post("/send-verification", auth, sendVerificationCode);
router.post("/verify-email", auth, verifyCode);
router.patch("/change-password", auth, changePassword);
router.patch("/toggle-2fa", auth, toggleTwoFactor);

module.exports = router;
