const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const router = express.Router();
const verifytoken= require("../Middleware/Auth");

const { register, login } = require("../Controller/auth-controller");
const User = require("../Model/User");


// Register bhai ye signup keliye
router.post("/register", register);

// Login bhai 
router.post("/login", login);

// Google OAuth bhai
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const username = encodeURIComponent(req.user.username || req.user.email); // safe encoding
    
    // Only one redirect here
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}&username=${username}`);
  }
);

//otp yahan se bro//
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Received email for OTP:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "Email not found." });
    }

    // ye manually kiya hu otp generate karne ke liye
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
    await user.save();

    // Nodemailer transporter ka use mail bhejne keliye
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email ye structure h kaise mail jaayega
    await transporter.sendMail({
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Your OTP Code for Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
          <img src="https://png.pngtree.com/template/20190530/ourmid/pngtree-letter-c-logo-vector-image_204408.jpg" alt="Chroma Meet Logo" style="width: 80px; height: auto; margin-bottom: 20px;" />
          <h1>Chroma Meet</h1>
          <p>Your OTP for password reset is:</p>
          <h2 style="color: #4A00E0;">${otp}</h2>
          <p>This OTP is valid for 10 minutes. If you didn’t request it, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error in send-otp:", error);
    res.status(500).json({ message: "Server error sending OTP." });
  }
});
router.post("/change-password", verifytoken, async (req, res) => {
  const userId = req.user.id; // ✅ Available because of middleware
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Please provide both current and new passwords." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.password) {
      return res.status(400).json({ message: "Password change not supported for Google login users." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error in /change-password:", error);
    res.status(500).json({ message: "Server error changing password." });
  }
});
// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // OTP valid — clear it
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "OTP verified. Proceed to reset your password." });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    res.status(500).json({ message: "Server error verifying OTP." });
  }
});

// Reset Password
// const crypto = require("crypto");

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log("Received token:", token);
const user = await User.findOne({
  resetPasswordToken: token,
  resetPasswordExpires: { $gt: Date.now() }
});
console.log("User found:", user);


  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }
  try {
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error resetting password." });
  }

  
});


module.exports = router;
