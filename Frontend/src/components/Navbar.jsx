import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { AuthContext } from "../AuthContext";
import img from "../assets/Group.png";

function Navbar() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleDashboardClick() {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/login");
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <nav className="fixed md:top-0 md:px-5 top-0 px-2 w-full shadow-lg rounded z-50 bg-white">
      <div className="mx-auto flex lg:justify-around items-center justify-between px-6 py-3">
        <Link to="/">
          <div className="lg:text-3xl md:text-xl text-[20px] font-bold md:mb-0 flex items-center gap-2 justify-center">
            <img src={img} alt="" className="w-[51px]" />
            <h1 className="lg:text-[30px] font-bold">
              Ne<span className="text-[#fa1239]">xu</span>s
            </h1>
          </div>
        </Link>

        <div className="md:hidden text-2xl cursor-pointer" onClick={toggleMenu}>
          {menuOpen ? <IoCloseSharp /> : <CiMenuFries />}
        </div>

        <ul className="hidden md:flex items-center space-x-7 font-medium">
          <li>
            <Link to="/" className="hover:border-b-2 border-[#fa1239]">
              Home
            </Link>
          </li>
          <li>
            <Link to="/analytics" className="hover:border-b-2 border-[#fa1239]">
              Analytics
            </Link>
          </li>
          <li>
            <Link to="/pricing" className="hover:border-b-2 border-[#fa1239]">
              Pricing
            </Link>
          </li>
        </ul>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleDashboardClick}
            className="border border-[#fa1239] bg-[#fa1239] rounded-[27px] py-1 px-4 text-[#fff] font-medium shadow hover:scale-105 transition-all"
          >
            {isLoggedIn ? user?.name : "Dashboard"}
          </button>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="border border-[#fa1239] text-[#fa1239] bg-white rounded-[27px] py-1 px-4 font-medium shadow hover:bg-[#fa1239] hover:text-white transition-all scale-95"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute md:hidden bg-white h-[100vh] text-center right-0 top-18 w-[87%] py-28 shadow-2xl">
          <ul className="flex flex-col space-y-10 text-lg font-medium">
            <li>
              <Link to="/" onClick={toggleMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/analytics" onClick={toggleMenu}>
                Analytics
              </Link>
            </li>
            <li>
              <Link to="/pricing" onClick={toggleMenu}>
                Pricing
              </Link>
            </li>
          </ul>

          <div className="mt-14 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                toggleMenu();
                handleDashboardClick();
              }}
              className="border border-[#fa1239] bg-[#fa1239] rounded-[20px] py-2 px-5 text-[#fff] font-medium text-[18px] shadow hover:scale-105 transition-all w-2/3"
            >
              {isLoggedIn ? user?.name : "Dashboard"}
            </button>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="border border-[#fa1239] text-[#fa1239] bg-white rounded-[20px] py-2 px-5 font-medium text-[18px] shadow transition-all w-2/3"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
