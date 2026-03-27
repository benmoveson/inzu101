const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'seeker',
      isVerified: false,
      verificationCode: otp,
      verificationCodeExpires: otpExpiry
    });

    // Send OTP via email
    try {
      await sendEmail({
        email: user.email,
        subject: "Verify Your INZU Account",
        message: `Your verification code is: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Welcome to INZU!</h1>
            <p>Thank you for signing up. Please use the following code to verify your account:</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h2 style="color: #1f2937; letter-spacing: 8px; font-size: 32px; margin: 0;">${otp}</h2>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - user can request resend
    }

    res.status(201).json({
      message: "OTP sent to your email",
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.twoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = code;
      user.verificationCodeExpires = Date.now() + 5 * 60 * 1000; // 5 mins
      await user.save();

      await sendEmail({
        email: user.email,
        subject: "Your 2FA Login Code",
        message: `Your login code is: ${code}`,
        html: `<div style="padding: 20px;"><h1>Login Code: ${code}</h1></div>`
      });

      return res.json({ requires2FA: true, userId: user._id });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;
    const user = await User.findById(userId);

    if (!user || user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.email !== email) {
      return res.status(400).json({ message: "Email mismatch" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationCode = otp;
    user.verificationCodeExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendEmail({
      email: user.email,
      subject: "Your New INZU Verification Code",
      message: `Your new verification code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">INZU Verification Code</h1>
          <p>Here's your new verification code:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #1f2937; letter-spacing: 8px; font-size: 32px; margin: 0;">${otp}</h2>
          </div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `
    });

    res.json({ message: "New OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.verificationCode = otp;
    user.verificationCodeExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendEmail({
      email: user.email,
      subject: "Reset Your INZU Password",
      message: `Your password reset code is: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Password Reset Request</h1>
          <p>You requested to reset your password. Use the code below to proceed:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #1f2937; letter-spacing: 8px; font-size: 32px; margin: 0;">${otp}</h2>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `
    });

    res.json({ message: "Password reset code sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.verificationCode !== otp || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.json({ message: "Code verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.verificationCode !== otp || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
