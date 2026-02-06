import React, { useContext, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import { AuthContext } from "../AuthContext";
import img from "../assets/Group.png";

function Navbar() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-3 md:px-8 py-3 md:py-4">
      <div className="mx-auto max-w-7xl glass-panel px-4 md:px-6 py-3 md:py-4 flex items-center justify-between backdrop-blur-xl bg-black/40 border-white/5 shadow-2xl">
        <Link to="/" className="group">
          <div className="flex items-center gap-2 md:gap-3">
            <img src={img} alt="Nexus" className="w-8 md:w-10 group-hover:scale-110 transition-transform" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Ne<span className="text-[#fa1239]">xu</span>s
            </h1>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center space-x-8">
          {[
            { name: "Home", path: "/" },
            { name: "Analytics", path: "/analytics" },
            { name: "Pricing", path: "/pricing" },
          ].map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#fa1239] ${isActive(link.path) ? "text-[#fa1239]" : "text-gray-300"
                  }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleDashboardClick}
            className="px-6 py-2 rounded-full bg-[#fa1239] text-white text-sm font-semibold hover:scale-105 transition-all shadow-lg shadow-[#fa1239]/20"
          >
            {isLoggedIn ? user?.name : "Launch Dashboard"}
          </button>
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-all"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden text-2xl text-white cursor-pointer" onClick={toggleMenu}>
          {menuOpen ? <IoCloseSharp /> : <CiMenuFries />}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[101] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMenu} />
          <div className="absolute right-0 top-0 h-full w-4/5 max-w-xs bg-[#050505] border-l border-white/5 p-8 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={toggleMenu} className="text-2xl"><IoCloseSharp /></button>
            </div>

            <ul className="flex flex-col space-y-8">
              {["Home", "Analytics", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    onClick={toggleMenu}
                    className="text-lg font-medium text-gray-300 hover:text-[#fa1239]"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col gap-4">
              <button
                onClick={() => {
                  toggleMenu();
                  handleDashboardClick();
                }}
                className="w-full py-4 rounded-2xl bg-[#fa1239] text-white font-bold shadow-lg shadow-[#fa1239]/10"
              >
                {isLoggedIn ? user?.name : "Dashboard"}
              </button>
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-2xl border border-white/5 text-gray-400 font-medium"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
