const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require("path");
const User = require("../Model/User");

let otpStore = {}; 

exports.register = async (req, res) => {
  try {
    const { email, password, username} = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail)
      return res.status(400).json({ message: "Email already registered." });
   

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};




exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};



exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    console.log("Generated OTP:", otp);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) console.log("Email Transport Error:", error);
      else console.log("Email Server is Ready");
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="cid:logo" alt="Company Logo" style="width: 80px;"/>
    <h2 style="color: #fa1239; text-align: center;">Nexus</h2>
  </div>
  <h2 style="color: #4B0082; text-align: center;">Your OTP Code</h2>
  <p style="font-size: 16px; color: #333 text-align: center;">
    Hello <strong>${user.username || email}</strong>,<br/>
    Welcome to <strong>Our Peer-to-Peer Platform</strong>! <br/>
    Please use the following OTP to verify your email:
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <span style="display: inline-block; font-size: 28px; font-weight: bold; background-color: #eee; padding: 10px 20px; border-radius: 8px;">${otp}</span>
  </div>
  <p style="font-size: 14px; color: #666;">
    This OTP is valid for the next 10 minutes.<br/>
    If you did not request this, please ignore this email.
  </p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
  <p style="font-size: 12px; color: #999; text-align: center;">
    &copy; 2025 Nexus. All rights reserved.
  </p>
</div>

      `,
      attachments: [
        {
          filename: "Group.png",
          path: path.join(__dirname, "../../Frontend/src/assets/Group.png"),
          cid: "logo",
        },
      ],
    });

    res.json({ message: "OTP sent successfully to your email." });
  } catch (err) {
    console.log("OTP Error:", err);
    res
      .status(500)
      .json({ message: "Failed to send OTP.", error: err.message });
  }
};


exports.checkOtp = async (req, res) => {
  const { email, code } = req.body;

  if (otpStore[email] && otpStore[email] == String(code)) {
    delete otpStore[email];
    return res.json({ status: "approved" });
  }

  return res.status(400).json({ message: "Invalid or expired OTP" });
};



exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    await User.updateOne({ email }, { password: hashed });

    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password." });
  }
};
