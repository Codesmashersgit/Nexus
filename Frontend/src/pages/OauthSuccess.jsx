import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const username = query.get("username");

    if (token && username) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("username", username);
      navigate("/dashboard");
      window.location.reload(); // refresh to show navbar update
    } else {
      navigate("/login"); // fallback if something's missing
    }
  }, [location, navigate]);

  return <p>Signing in with Google...</p>;
}

export default OAuthSuccess;
