import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import axios from "axios";

function ForgotPassword() {
  const [phone, setPhone] = useState("");   // phone with country code, eg: 919876543210
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      // phone already formatted with country code, just add + before
      const fullPhone = "+" + phone;
      const res = await axios.post("http://localhost:5000/api/auth/send-otp", { phone: fullPhone });
      setMessage(res.data.message || "OTP sent to your phone.");
      setShowOtp(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const fullPhone = "+" + phone;
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { phone: fullPhone, otp });
      setMessage(res.data.message || "OTP verified successfully.");
      setOtp("");
      // handle token or next step
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 flex justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg lg:p-10 p-5 max-w-md w-full mt-32">
        <h2 className="text-2xl font-bold text-[#fa1239] mb-6 text-center">Forgot Password</h2>

        {message && <div className="text-green-600 text-sm text-center mb-4">{message}</div>}
        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

        {!showOtp ? (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-5">
            <PhoneInput
              country={'in'}              
              value={phone}
              onChange={phone => setPhone(phone)}
              inputProps={{
                name: 'phone',
                required: true,
                autoFocus: true
              }}
              inputStyle={{ width: '100%' }}
              disabled={loading}
              disableFormatting={false} 
            />
            <button
              type="submit"
              disabled={loading || phone.length < 10} 
              className={`bg-[#fa1239] text-white py-3 rounded-lg font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#d1112b]"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-gray-300 text-sm rounded-lg py-3 px-4"
              disabled={loading}
              maxLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-green-600 text-white py-3 rounded-lg font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
              }`}
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
