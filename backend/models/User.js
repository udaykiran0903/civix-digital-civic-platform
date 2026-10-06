const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["citizen", "official", "admin"],
      default: "citizen"
    },

    location: {
      type: String,
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    preferences: {
      darkMode: {
        type: Boolean,
        default: false,
      },
      emailNotifications: {
        type: Boolean,
        default: false,
      },
      inAppAlerts: {
        type: Boolean,
        default: false,
      },
      criticalAlertsOnly: {
        type: Boolean,
        default: false,
      },
    },

    adminVerification: {
      status: {
        type: String,
        enum: ["pending", "requested", "verified"],
        default: "pending",
      },
      officeId: {
        type: String,
        default: "",
      },
      requestedAt: Date,
      verifiedAt: Date,
    },

    // 🔐 OTP fields (Email Verification)
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    otpAttempts: {
      type: Number,
      default: 0
    },

    // 🔁 Future use (Forgot Password)
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);