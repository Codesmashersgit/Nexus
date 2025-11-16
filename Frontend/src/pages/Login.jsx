
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const SERVER_URL = "http://localhost:5000";


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = res.data;

      // Save token & username to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", user.username || user.email);

      // Navigate and reload to reflect login state
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleGoogle = () => {
    window.location.href = `${SERVER_URL}/api/auth/google`;
  };

  return (
    <div className="md:min-h-screen flex items-center justify-center py-20">
      <div className="bg-white rounded-xl shadow-lg lg:p-10 w-full lg:w-auto p-5">
        <h2 className="md:text-3xl text-2xl font-bold text-[#fa1239] mb-8 text-center">
          Login to Your Account
        </h2>

        {/* Google Login */}
        <button
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg py-3 text-gray-700 hover:shadow-md transition"
          onClick={handleGoogle}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-400 font-semibold">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg py-3 px-4 lg:w-80"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg py-3 px-4"
          />

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-[#fa1239] font-normal hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="bg-[#fa1239] text-white py-3 rounded-lg font-semibold hover:bg-[#e1052a] transition"
          >
            Login
          </button>
        </form>

        
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#fa1239] font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
