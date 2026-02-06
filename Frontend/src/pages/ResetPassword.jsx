
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
    <div className="home-container min-h-screen flex items-center justify-center py-28 px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      <div className="glass-panel backdrop-blur-2xl bg-black/40 border-white/5 shadow-2xl lg:p-12 w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        <h2 className="text-3xl md:text-4xl font-black mb-2 text-center tracking-tight text-white">
          Reset <span className="text-[#fa1239]">Password</span>
        </h2>
        <p className="text-gray-400 text-center mb-10 text-sm font-medium">Create a strong, unique password for your account</p>

        {msg && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs py-3 rounded-xl text-center font-medium mb-6 animate-pulse">
            {msg}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 rounded-xl text-center font-medium mb-6 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fa1239] text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-xl shadow-[#fa1239]/20"
          >
            {loading ? "Resetting..." : "Update Password"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-500 hover:text-white transition-colors text-sm font-bold tracking-wide"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}

