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
      navigate(redirectPath || "/dashboard");
      localStorage.removeItem("redirectPath");
      window.location.reload(); // refresh to update navbar or user state
    } else {
      navigate("/login"); // fallback if any info is missing
    }
  }, [location, navigate]);

  return <p>Signing in with Google...</p>;
}

export default OAuthSuccess;
