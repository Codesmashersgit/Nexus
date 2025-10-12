import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");  // phone value will be in full international format without '+'
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation: phone length
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        password,
        username: fullName,
        phone: "+" + phone, 
      });

      const { token } = res.data;
      localStorage.setItem("authToken", token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Sign up failed");
    }
  };

  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
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

          <PhoneInput
            country={'in'}  // default country India
            value={phone}
            onChange={setPhone}
            inputProps={{
              name: 'phone',
              required: true,
              autoFocus: false
            }}
            inputStyle={{ width: '100%', borderRadius: '0.5rem', padding: '0.75rem', borderColor: '#d1d5db' }}  // Tailwind gray-300 = #d1d5db
            containerStyle={{}}
            countryCodeEditable={true}
            disableCountryCode={false}
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
          <Link to="/login" className="text-[#fa1239] font-normal hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
