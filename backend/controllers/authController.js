const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
} = require("../utils/emailTemplate");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const isEmailConfigured = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return false;
  if (user === "your_gmail_address") return false;
  if (pass === "your_gmail_app_password") return false;

  return true;
};

// ================= GENERATE JWT =================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      location: user.location,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// ================= REGISTER USER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;
    const requestedRole = role || "citizen";
    const allowedSelfRoles = ["citizen", "official"];

    if (!name || !email || !password || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!allowedSelfRoles.includes(requestedRole)) {
      return res.status(400).json({
        message: "Only citizen or official registration is allowed",
      });
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({
        message:
          "Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in backend/.env.",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: "User already exists" });
      }

      const otp = generateOtp();
      userExists.verificationToken = hashOtp(otp);
      userExists.verificationTokenExpiresAt = Date.now() + 5 * 60 * 1000;
      userExists.otpAttempts = 0;
      await userExists.save();

      const html = getVerificationEmailTemplate(otp);
      await sendEmail({
        to: email,
        subject: "Verify Your Email - Civix",
        html,
      });

      return res.status(200).json({
        message: "Account exists but is not verified. A new OTP was sent.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate and hash OTP
    const otp = generateOtp();
    const hashedOTP = hashOtp(otp);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: requestedRole,
      location,
      verificationToken: hashedOTP,
      verificationTokenExpiresAt: Date.now() + 5 * 60 * 1000, // 5 min
      otpAttempts: 0,
    });

    // Send OTP Email
    const html = getVerificationEmailTemplate(otp);
    await sendEmail({
      to: email,
      subject: "Verify Your Email - Civix",
      html: html,
    });

    return res.status(201).json({
      message: "OTP sent to your email. Please verify before login.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// ================= RESEND VERIFICATION OTP =================
exports.resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isEmailConfigured()) {
      return res.status(500).json({
        message:
          "Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in backend/.env.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = generateOtp();
    user.verificationToken = hashOtp(otp);
    user.verificationTokenExpiresAt = Date.now() + 5 * 60 * 1000;
    user.otpAttempts = 0;
    await user.save();

    const html = getVerificationEmailTemplate(otp);
    await sendEmail({
      to: email,
      subject: "Verify Your Email - Civix",
      html,
    });

    return res.status(200).json({
      message: "A new OTP was sent to your email.",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

// ================= VERIFY EMAIL =================
exports.verifyEmail = async (req, res) => {
  console.log("VERIFY HIT");
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.verificationToken || !user.verificationTokenExpiresAt) {
      return res.status(400).json({
        message: "No active OTP found. Please request a new OTP.",
      });
    }

    if (user.verificationTokenExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please register again.",
      });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.verificationToken) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Success
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.otpAttempts = 0;

    await user.save();
    const welcomeHtml = getWelcomeEmailTemplate(user.name);

    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Civix ",
        html: welcomeHtml,
      });
    } catch (emailError) {
      console.error("Welcome email failed:", emailError.message);
    }

    res.status(200).json({
      message: "Email verified successfully. You can now login.",
      redirectTo: "login",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const otpDevMode = process.env.OTP_DEV_MODE === "true";

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordToken = hashedOTP;
    user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000;

    await user.save();

    if (otpDevMode) {
      return res.json({
        message: "Password reset OTP generated in development mode.",
        devOtp: otp,
      });
    }

    const html = `<h2>Your OTP for password reset: ${otp}</h2>`;

    await sendEmail({
      to: user.email,
      subject: "Reset Password OTP",
      html,
    });

    res.json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.resetPasswordToken)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.resetPasswordExpiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.isVerified = true;

    await user.save();

    res.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN USER =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Please select the correct login type.`,
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      location: user.location,
      preferences: user.preferences,
      adminVerification: user.adminVerification,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { name, email, location, preferences, adminVerification } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (location) user.location = location;

    if (preferences && typeof preferences === "object") {
      const currentPreferences = user.preferences || {};
      user.preferences = {
        ...currentPreferences,
        ...(typeof preferences.darkMode === "boolean"
          ? { darkMode: preferences.darkMode }
          : {}),
        ...(typeof preferences.emailNotifications === "boolean"
          ? { emailNotifications: preferences.emailNotifications }
          : {}),
        ...(typeof preferences.inAppAlerts === "boolean"
          ? { inAppAlerts: preferences.inAppAlerts }
          : {}),
        ...(typeof preferences.criticalAlertsOnly === "boolean"
          ? { criticalAlertsOnly: preferences.criticalAlertsOnly }
          : {}),
      };
    }

    if (
      adminVerification
      && typeof adminVerification === "object"
      && ["official", "admin"].includes(user.role)
    ) {
      const currentAdminVerification = user.adminVerification || {};
      const officeId = typeof adminVerification.officeId === "string"
        ? adminVerification.officeId.trim()
        : currentAdminVerification.officeId || "";

      let status = currentAdminVerification.status || "pending";
      let requestedAt = currentAdminVerification.requestedAt;
      let verifiedAt = currentAdminVerification.verifiedAt;

      if (adminVerification.request === true) {
        status = user.role === "admin" ? "verified" : "requested";
        requestedAt = new Date();
        if (user.role === "admin") {
          verifiedAt = new Date();
        }
      }

      user.adminVerification = {
        ...currentAdminVerification,
        officeId,
        status,
        requestedAt,
        verifiedAt,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        preferences: user.preferences,
        adminVerification: user.adminVerification,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
