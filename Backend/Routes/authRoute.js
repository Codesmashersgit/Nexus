const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const router = express.Router();
const verifytoken = require("../Middleware/Auth");

const { register, login } = require("../Controller/auth-controller");
const User = require("../Model/User");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const username = encodeURIComponent(req.user.username || req.user.email); // safe encoding

    // Redirect with token and username
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}&username=${username}`);
  }
);

// Verify OTP route
require('dotenv').config();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;           
  if (!phone) return res.status(400).json({ error: 'phone required' });

  try {
    const verification = await client.verify.services(serviceSid)
      .verifications.create({ to: phone, channel: 'sms' });
    res.json({ sid: verification.sid, status: verification.status });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/check-otp', async (req, res) => {
  const { phone, code } = req.body;
  try {
    const result = await client.verify.services(serviceSid)
      .verificationChecks.create({ to: phone, code });
    res.json({ status: result.status });
  } catch (err) {
    console.error('Verify check error:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
