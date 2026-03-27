const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.sendVerificationCode = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isVerified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        user.verificationCode = code;
        user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        const message = `Your INZUU verification code is: ${code}. It expires in 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Verify your INZUU account",
                message,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #222;">
            <h2>Verify your account</h2>
            <p>Your verification code is:</p>
            <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${code}</h1>
            <p>This code expires in 10 minutes.</p>
          </div>
        `,
            });

            res.status(200).json({ message: "Verification code sent to email" });
        } catch (err) {
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();
            console.error(err);
            return res.status(500).json({ message: "Error sending email. Please try again later." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyCode = async (req, res) => {
    try {
        const { code } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired code" });
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Account verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an image" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Upload image to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "avatars" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        user.avatar = result.secure_url;
        await user.save();

        res.status(200).json({
            message: "Avatar updated successfully",
            avatar: user.avatar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating avatar" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleTwoFactor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.twoFactorEnabled = !user.twoFactorEnabled;
        await user.save();

        res.status(200).json({
            message: `Two-factor authentication ${user.twoFactorEnabled ? 'enabled' : 'disabled'}`,
            twoFactorEnabled: user.twoFactorEnabled
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                avatar: user.avatar,
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorEnabled,
                language: user.language,
                theme: user.theme,
                role: user.role,
                district: user.district
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, location, language, theme, district } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update only provided fields
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (language !== undefined) user.language = language;
        if (theme !== undefined) user.theme = theme;
        if (district !== undefined) user.district = district;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                avatar: user.avatar,
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorEnabled,
                language: user.language,
                theme: user.theme,
                role: user.role,
                district: user.district
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required to delete account" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Verify password before deletion
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        // Delete all associated data
        const Inquiry = require("../models/Inquiry");
        const Message = require("../models/Message");
        const Conversation = require("../models/Conversation");
        const Notification = require("../models/Notification");

        // Delete user's inquiries
        await Inquiry.deleteMany({ userId: user._id });

        // Delete user's messages
        await Message.deleteMany({ $or: [{ senderId: user._id }, { recipientId: user._id }] });

        // Delete user's conversations
        await Conversation.deleteMany({ participants: user._id });

        // Delete user's notifications
        await Notification.deleteMany({ userId: user._id });

        // Note: Favorites are embedded in the User model, so they'll be deleted with the user
        // Note: Reviews would be deleted here if a Review model exists

        // Delete the user account
        await User.findByIdAndDelete(user._id);

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).json({ message: "Failed to delete account" });
    }
};

exports.removeAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.avatar = null;
        await user.save();

        res.status(200).json({
            message: "Avatar removed successfully",
            avatar: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error removing avatar" });
    }
};
