const User = require("../Model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();


// Register
const register = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, username });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({
      token,
      user: { username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({
      token,
      user: { username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 465,              
  secure: true,           
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});


// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    await user.save();

    await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Your OTP for Password Reset",
  html: `
    <div style="font-family: 'Arial', sans-serif; background: #f9f9f9; padding: 40px; text-align: center;">
      <div style="max-width: 600px; margin: auto; border-radius: 12px; background: #ffffff; padding: 40px; box-shadow: 0 10px 30px rgba(250, 18, 57, 0.2);">
        
        <img src="https://nexus1802.netlify.app/assets/Group-BxPgapkn.png" alt="Nexus Logo" width="60" style="margin-bottom: 20px;" />

        <h1 style="font-size: 28px; color: #fa1239; margin-bottom: 10px;">Your One-Time Password</h1>
        <p style="color: #555555; font-size: 16px; margin-bottom: 30px;">
          Enter the OTP below to reset your password. It will expire in 10 minutes.
        </p>
        
        <div style="font-size: 48px; font-weight: bold; color: #fa1239; letter-spacing: 4px; margin-bottom: 30px;">
          ${otp}
        </div>
        
        <a href="https://nexus1802.netlify.app/login" 
           style="display: inline-block; background: linear-gradient(135deg, #fa1239, #ff6a00); color: #fff; padding: 15px 40px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Go to Login
        </a>
        
        <p style="color: #999999; font-size: 12px; margin-top: 30px;">
          If you did not request this, please ignore this email.
        </p>
      </div>
    </div>
  `,
});


    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Check OTP
const checkOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== code || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    res.json({ status: "approved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, password, code } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (
      !user.otp ||
      user.otp !== code ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { register, login, sendOtp, checkOtp, resetPassword };
