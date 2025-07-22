

// import React, { useState } from "react";
// import axios from "axios";

// function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [showOtp, setShowOtp] = useState(false);

//   const handleEmailSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");

//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/send-otp", {
//         email,
//       });
//       setMessage(res.data.message || "OTP sent to your email.");
//       // Don't clear email here because you need it for OTP verification
//       setShowOtp(true);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to send OTP.");
//     }
//   };

//   const handleOtpVerify = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");

//     try {
//       const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
//         email, // email preserved here
//         otp,
//       });
//       setMessage(res.data.message || "OTP verified successfully.");
//       setOtp("");
//       // TODO: Redirect or show reset password form here
//     } catch (err) {
//       setError(err.response?.data?.message || "OTP verification failed.");
//     }
//   };

//   return (
//     <div className="lg:min-h-screen flex items-center justify-center py-28">
//       <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full">
//         <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
//           Forgot Password
//         </h2>

//         {message && <div className="text-green-600 text-sm text-center">{message}</div>}
//         {error && <div className="text-red-500 text-sm text-center">{error}</div>}

//         {!showOtp ? (
//           <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="border border-gray-300 text-sm rounded-lg py-3 px-4"
//             />
//             <button
//               type="submit"
//               className="bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
//             >
//               Send OTP
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleOtpVerify} className="flex flex-col gap-5">
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               required
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="border border-gray-300 text-sm rounded-lg py-3 px-4"
//             />
//             <button
//               type="submit"
//               className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
//             >
//               Verify OTP
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ForgotPassword;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });
      setMessage(res.data.message || "OTP verified successfully.");
      setOtp("");

      // Assuming backend sends back a token on successful OTP verification
      const token = res.data.token;
      if (token) {
        navigate(`/reset-password/${token}`);
      } else {
        setError("No token received from server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:min-h-screen flex items-center justify-center py-28 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full">
        <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">Forgot Password</h2>

        {message && <div className="text-green-600 text-sm text-center mb-4">{message}</div>}
        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

        {!showOtp ? (
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
              className={`bg-purple-600 text-white py-3 rounded-lg font-semibold transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
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
