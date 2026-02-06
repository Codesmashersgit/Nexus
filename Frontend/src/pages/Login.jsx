

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Home.css"; // Reuse mesh gradient styles

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

  // Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", user.username || user.email);
      localStorage.setItem("email", user.email);

      const redirectPath = localStorage.getItem("redirectPath");
      const from = redirectPath || location.state?.from?.pathname || "/dashboard";
      localStorage.removeItem("redirectPath");

      navigate(from, { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  // Google login (redirect in same window)
  const handleGoogle = () => {
    // If there is a "from" state but no redirectPath in storage, save it now
    if (location.state?.from?.pathname && !localStorage.getItem("redirectPath")) {
      localStorage.setItem("redirectPath", location.state.from.pathname + (location.state.from.search || ""));
    }
    window.location.href = `${SERVER_URL}/api/auth/google`;
  };

  return (
    <div className="home-container min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      <div className="glass-panel backdrop-blur-2xl bg-black/40 border-white/5 shadow-2xl p-6 md:p-12 w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <h2 className="text-2xl md:text-4xl font-bold mb-2 text-center tracking-tight">
          Welcome <span className="text-[#fa1239]">Back</span>
        </h2>
        <p className="text-gray-400 text-center mb-8 md:mb-10 text-xs md:text-sm font-medium">Please enter your details to sign in</p>

        {/* Google Login */}
        <button
          className="flex items-center justify-center gap-3 w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 text-white font-medium hover:bg-white/10 transition-all active:scale-[0.98]"
          onClick={handleGoogle}
        >
          <FcGoogle size={22} />
          Continue with Google
        </button>

        <div className="flex items-center my-8">
          <hr className="flex-grow border-white/5" />
          <span className="mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">or</span>
          <hr className="flex-grow border-white/5" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 rounded-xl text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#fa1239] font-bold hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#fa1239]/50 transition-all font-medium"
            />
          </div>

          <button
            type="submit"
            className="bg-[#fa1239] text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 transition-all active:scale-[0.98] shadow-xl shadow-[#fa1239]/20"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 text-sm">
          New here?{" "}
          <Link
            to="/signup"
            state={{ from: location.state?.from }}
            className="text-[#fa1239] font-bold hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
