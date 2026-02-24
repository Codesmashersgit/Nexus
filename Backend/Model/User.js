const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otp: String, // New: OTP code
    otpExpires: Date, // New: OTP expiry
    subscription: {
      planType: { type: String, default: 'free' },
      active: { type: Boolean, default: false },
      expiresAt: { type: Date },
      processedPayments: [{ type: String }] // track razorpay_payment_id to prevent duplicates
    } // Updated: detailed subscription info
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

