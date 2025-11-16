const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
require("dotenv").config();


const {
  sendOtp,
  checkOtp,
  resetPassword
} = require("../Controller/auth-controller");

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
    if (!req.user) {
      return res.status(401).json({ message: "Google authentication failed" });
    }

    // JWT generate
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const username = encodeURIComponent(req.user.username || req.user.email);

    // Safe client URL
    const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : "http://localhost:5173";

    // Redirect
    res.redirect(`${clientUrl}/oauth-success?token=${token}&username=${username}`);
  }
);

router.post("/send-otp", sendOtp);
router.post("/check-otp", checkOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
