// import { useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// function OAuthSuccess() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     if (location.pathname.startsWith("//")) {
//       const fixedPath = location.pathname.replace(/^\/\//, "/") + location.search;
//       navigate(fixedPath, { replace: true });
//       return;
//     }
//     const query = new URLSearchParams(location.search);
//     const token = query.get("token");
//     const username = query.get("username");

//     if (token && username) {
//       localStorage.setItem("authToken", token);
//       localStorage.setItem("username", username);
//       navigate("/dashboard");
//       window.location.reload(); // refresh to show navbar update
//     } else {
//       navigate("/login"); // fallback if something's missing
//     }
//   }, [location, navigate]);

//   return <p>Signing in with Google...</p>;
// }

// export default OAuthSuccess;



import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fix double slash issue if any
    if (location.pathname.startsWith("//")) {
      const fixedPath = location.pathname.replace(/^\/\//, "/") + location.search;
      navigate(fixedPath, { replace: true });
      return;
    }

    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const username = query.get("username");
    const email = query.get("email"); // ✅ fetch email

    if (token && username && email) {
      // Save everything to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", username);
      localStorage.setItem("email", email); // ✅ save email

      const redirectPath = localStorage.getItem("redirectPath");
      const target = redirectPath || "/dashboard";

      // Delay slightly for smooth transition
      setTimeout(() => {
        navigate(target);
        localStorage.removeItem("redirectPath");
        window.location.reload();
      }, 1500);
    } else {
      navigate("/login"); // fallback if any info is missing
    }
  }, [location, navigate]);

  return (
    <div className="home-container min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/5 border-t-[#fa1239] rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-[#fa1239]/20 blur-2xl rounded-full"></div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Authenticating</h2>
          <p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Securing your Nexus session...</p>
        </div>
      </div>
    </div>
  );
}

export default OAuthSuccess;
