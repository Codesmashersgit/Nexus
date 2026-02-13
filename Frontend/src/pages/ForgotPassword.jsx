import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function OtpInput({ otp, setOtp, length = 6 }) {
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };


  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleBackspace(e, index)}
          className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl text-white focus:border-[#fa1239] focus:ring-1 focus:ring-[#fa1239] outline-none transition-all font-bold"
        />
      ))}
    </div>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/send-otp`, { email });
      setMessage(res.data.message || "OTP sent to your email.");
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/check-otp`, {
        email,
        code: otp.join("")
      });

      if (res.data.status === "approved") {
        setMessage("OTP verified successfully.");
        setIsVerified(true);
        setShowOtp(false);
      } else {
        setError("Invalid or expired OTP.");
      }
      setOtp(Array(6).fill(""));
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/reset-password`, {
        email,
        password: newPassword,
         code: otp.join("")
      });
      setOtp(Array(6).fill(""));

      setMessage(res.data.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

      setIsVerified(false);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container min-h-screen flex items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      <div className="glass-panel backdrop-blur-2xl bg-black/40 border-white/5 shadow-2xl lg:p-12 w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl md:text-4xl font-black mb-2 text-center tracking-tight text-white">
          Forgot <span className="text-[#fa1239]">Password</span>
        </h2>
        <p className="text-gray-400 text-center mb-10 text-sm font-medium">Protect your account with a new security key</p>

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs py-3 rounded-xl text-center font-medium mb-6 animate-pulse">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 rounded-xl text-center font-medium mb-6 animate-pulse">
            {error}
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {!showOtp && !isVerified && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#fa1239] text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-xl shadow-[#fa1239]/20 flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP INPUT */}
        {showOtp && !isVerified && (
          <form onSubmit={handleOtpVerify} className="flex flex-col gap-8 items-center">
            <OtpInput otp={otp} setOtp={setOtp} length={6} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fa1239] text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-xl shadow-[#fa1239]/20"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {isVerified && (
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#fa1239] text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-xl shadow-[#fa1239]/20"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-wide"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
