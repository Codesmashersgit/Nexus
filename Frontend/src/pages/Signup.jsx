import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await axios.post(`${SERVER_URL}/api/auth/register`, {
        email,
        password,
        username: fullName,
      });

      const { token, user } = res.data;
      // Save token and username in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", user.username);

      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };

  const handleGoogle = () => {
    window.location.href = `${SERVER_URL}/api/auth/google`;
  };

  return (
    <div className="md:min-h-screen flex justify-center py-20">
      <div className="bg-white rounded-xl shadow-lg lg:p-10 lg:w-[400px] w-full p-5">
        <h2 className="md:text-3xl text-2xl font-bold text-[#fa1239] mb-8 text-center">
          Create an Account
        </h2>

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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <input
            type="text"
            placeholder="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="border border-gray-300 rounded-lg py-3 px-4 "
          />
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded-lg py-3 px-4"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg py-3 px-4"
          />
          <button
            type="submit"
            className="bg-[#fa1239] text-white py-3 rounded-lg font-semibold hover:bg-[#e1052a] transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            state={{ from: location.state?.from }}
            className="text-[#fa1239] font-normal hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
