const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["landlord", "seeker"],
      default: "seeker",
    },
    language: {
      type: String,
      enum: ["en", "rw", "fr"],
      default: "en",
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    phone: String,
    free_listings_used: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: String,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }],
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    district: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
