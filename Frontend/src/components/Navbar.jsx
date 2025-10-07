
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import img from "../assets/Group.png"

function Navbar() {
  const [username, setUsername] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    const token= localStorage.getItem("authToken");
    if (storedName && token) {
      setUsername(storedName);
    }
    else{
      setUsername("Dashboard");
    }
  }, []);

  function handleDashboardClick() {
    if (username ) {
      navigate("/dashboard");
    }
    else{
      navigate("/login")

    }
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <nav className="fixed md:top-0 md:px-5 top-0 px-2 w-full shadow-lg rounded">
      <div className="mx-auto flex justify-around items-center px-6 py-3 z-50 ">
        <div className="lg:text-3xl md:text-xl text-[20px] font-bold md:mb-0 flex items-center gap-2 justify-center">
          <img src={img}alt="" className="w-[51px]"></img>
          <h1 className="lg:text-[30px] font-bold">Ne<span className="text-[#fa1239]">xu</span>s</h1>
        </div>

        <div className="md:hidden text-2xl cursor-pointer" onClick={toggleMenu}>
          {menuOpen ? <IoCloseSharp /> : <CiMenuFries />}
        </div>

        <ul className="hidden md:flex items-center space-x-7 font-medium">
          <li><Link to="/" className="hover:border-b-2 border-[#07f2ee]">Home</Link></li>
          <li><Link to="/analytics" className="hover:border-b-2 border-[#07f2ee]">Analytics</Link></li>
          <li><Link to="/pricing" className="hover:border-b-2 border-[#07f2ee]">Pricing</Link></li>
        </ul>

        {/* Username or Dashboard Button (Desktop) */}
        <div className="hidden md:block">
          <button
            onClick={handleDashboardClick}
            className="border border-[#07f2ee] rounded-[27px] py-1 px-4 text-[#1E1E1E] font-medium shadow hover:scale-105 transition-all"
          >
            {username ? username : "Dashboard"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className=" absolute md:hidden bg-white h-[100vh] text-center right-0 top-18 w-[87%] py-28">
          <ul className="flex flex-col space-y-10 text-lg font-medium">
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/analytics" onClick={toggleMenu}>Analytics</Link></li>
            <li><Link to="/pricing" onClick={toggleMenu}>Pricing</Link></li>
          </ul>

          <div className="mt-14">
            <button
              onClick={() => {
                toggleMenu();
                handleDashboardClick();
              }}
              className="border border-[#07f2ee] rounded-[20px] py-1 px-4 font-medium shadow hover:scale-105 transition-all"
            >
              {username ? username : "Dashboard"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
