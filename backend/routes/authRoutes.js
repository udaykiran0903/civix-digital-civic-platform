

const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationOtp);

router.post("/login", loginUser);

// ADD THESE TWO
router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.put("/change-password", auth, changePassword);

module.exports = router;