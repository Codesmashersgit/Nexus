import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("authToken");
    if (storedUsername && token) {
      setUsername(storedUsername);
    }
  }, []);

  const firstLetter = username ? username.charAt(0).toUpperCase() : "";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    setUsername(""); 
    navigate("/login");
  };

  return (
    <div className="navbar md:absolute top-2 left-0 w-full flex items-center justify-between md:px-5 px-2 py-2 transition-all duration-300 z-50">
      <Link to="/">
        <div className="logo flex items-center gap-2">
          <h1 className="md:text-[30px] text-[25px] font-bold text-purple-600">
            Chroma<span className="md:text-xl text-lg">meet</span>
          </h1>
        </div>
      </Link>

      <div className="icon flex items-center gap-4">
        {username ? (
          <>
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">
              {firstLetter}
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex text-red-500 md:px-4 md:py-2 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="md:px-4 md:py-2 text-purple-600 hover:text-purple-700 transition"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navbar;
