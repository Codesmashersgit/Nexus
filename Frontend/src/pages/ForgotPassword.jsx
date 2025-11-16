import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔥 Hotstar-style OTP COMPONENT
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
          className="w-12 h-12 border border-gray-400 rounded-lg text-center text-xl"
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

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", { email });
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
      const res = await axios.post("http://localhost:5000/api/auth/check-otp", {
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
      const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
        password: newPassword
      });

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
    <div className="pt-28 flex justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg lg:p-10 p-5 max-w-md w-full mt-32">
        <h2 className="text-2xl font-bold text-[#fa1239] mb-6 text-center">
          Forgot Password
        </h2>

        {message && <div className="text-green-600 text-sm text-center mb-4">{message}</div>}
        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

        {/* STEP 1: EMAIL INPUT */}
        {!showOtp && !isVerified && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 text-sm rounded-lg py-3 px-4"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#fa1239] text-white py-3 rounded-lg font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#d1112b]"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP INPUT */}
        {showOtp && !isVerified && (
          <form onSubmit={handleOtpVerify} className="flex flex-col gap-5 items-center">
            <OtpInput otp={otp} setOtp={setOtp} length={6} />

            <button
              type="submit"
              disabled={loading}
              className={`bg-green-600 w-full text-white py-3 rounded-lg font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
              }`}
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {isVerified && (
          <form onSubmit={handlePasswordReset} className="flex flex-col gap-5">
            <input
              type="password"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-gray-300 text-sm rounded-lg py-3 px-4"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border border-gray-300 text-sm rounded-lg py-3 px-4"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white py-3 rounded-lg font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
