
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${SERVER_URL}/api/auth/reset-password/${token}`, {
        password,
      });
      setMsg(res.data.message || "Password reset successfully.");
      setPassword("");
      setConfirmPassword("");
      setLoading(false);
      navigate("/login");

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Error resetting password.");
    }
  };

  return (
    <div className="lg:min-h-screen flex items-center justify-center py-28">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
          Reset Password
        </h2>

        {msg && <div className="text-green-600 text-center mb-4">{msg}</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="password"
            placeholder="Enter new password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 text-sm rounded-lg py-3 px-4"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 text-sm rounded-lg py-3 px-4"
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 text-white py-3 rounded-lg font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700 transition"
            }`}
          >
            {loading ? "Please wait..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

