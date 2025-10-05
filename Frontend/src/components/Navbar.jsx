

// import React, { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { CiMenuFries } from "react-icons/ci";
// import { IoCloseSharp } from "react-icons/io5";

 
// function Navbar() {
//   const [username, setUsername] = useState(null);
//   const navigate = useNavigate();
//  const [menuOpen, setMenuOpen] = useState(false);
//   useEffect(() => {
//     const storedName = localStorage.getItem("username");
//     if (storedName) {
//       setUsername(storedName);
//     }
//   }, []);

//   function handleDashboardClick() {
//     const token = localStorage.getItem("token");
//     if (token) {
//       navigate("/dashboard");
//     } else {
//       navigate("/login");
//     }
//   }
//   function toggleMenu() {
//     setMenuOpen(!menuOpen);
//   }

//   return (
//     <nav className="fixed md:top-7 md:px-5 top-3 px-2 w-full z-50 ">
//       <div className=" mx-auto flex justify-between items-center px-6 py-4">
//         {/* Logo */}
//         <div className="lg:text-3xl md:text-xl text-[20px] font-bold md:mb-0">
//           Chroma<span className="lg:text-xl font-normal">meet</span>
//         </div>
//          <div className="md:hidden text-2xl cursor-pointer" onClick={toggleMenu}>
//           {menuOpen ? <IoCloseSharp />  :<CiMenuFries /> }
//         </div>

//         {/* Nav Links */}
//         <ul className="hidden md:flex items-center space-x-7 font-medium">
//           <li><Link to="/" className="hover:underline">Home</Link></li>
//           <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
//           <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
//         </ul>

//         {/* Username or Dashboard Button (Desktop) */}
//         <div className="hidden md:block">
//           {username ? (
//             <div className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-4 text-[#1E1E1E] font-medium shadow">
//               {username}
//             </div>
//           ) : (
//             <button
//               onClick={handleDashboardClick}
//               className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-4 text-[#1E1E1E] font-medium shadow hover:scale-105 transition-all"
//             >
//               Dashboard
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Mobile Menu Dropdown */}
//       {menuOpen && (
//         <div className="md:hidden bg-white h-[80vh] text-center mx-6 py-28">
//           <ul className="flex flex-col space-y-6 text-lg font-medium">
//             <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
//             <li><Link to="/analytics" onClick={toggleMenu}>Analytics</Link></li>
//             <li><Link to="/pricing" onClick={toggleMenu}>Pricing</Link></li>
//           </ul>

//           <div className="mt-4">
//             {username ? (
//               <div className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-4 text-[#1E1E1E] font-medium shadow">
//                 {username}
//               </div>
//             ) : (
//               <button
//                 onClick={() => {
//                   toggleMenu();
//                   handleDashboardClick();
//                 }}
//                 className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-4 text-[#1E1E1E] font-medium shadow hover:scale-105 transition-all"
//               >
//                 Dashboard
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;
import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CiMenuFries } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";

function Navbar() {
  const [username, setUsername] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
    }
  }, []);

  // ✅ No token check anymore
  function handleDashboardClick() {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
  }

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  return (
    <nav className="fixed md:top-7 md:px-5 top-3 px-2 w-full z-50">
      <div className="mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <div className="lg:text-3xl md:text-xl text-[20px] font-bold md:mb-0">
          Chroma<span className="lg:text-xl font-normal">meet</span>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden text-2xl cursor-pointer" onClick={toggleMenu}>
          {menuOpen ? <IoCloseSharp /> : <CiMenuFries />}
        </div>

        {/* Navigation Links (Desktop) */}
        <ul className="hidden md:flex items-center space-x-7 font-medium">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/analytics" className="hover:underline">Analytics</Link></li>
          <li><Link to="/pricing" className="hover:underline">Pricing</Link></li>
        </ul>

        {/* Username or Dashboard Button (Desktop) */}
        <div className="hidden md:block">
          <button
            onClick={handleDashboardClick}
            className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-4 text-[#1E1E1E] font-medium shadow hover:scale-105 transition-all"
          >
            {username ? username : "Dashboard"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white h-[80vh] text-center mx-6 py-28">
          <ul className="flex flex-col space-y-6 text-lg font-medium">
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/analytics" onClick={toggleMenu}>Analytics</Link></li>
            <li><Link to="/pricing" onClick={toggleMenu}>Pricing</Link></li>
          </ul>

          <div className="mt-4">
            <button
              onClick={() => {
                toggleMenu();
                handleDashboardClick();
              }}
              className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-4 text-[#1E1E1E] font-medium shadow hover:scale-105 transition-all"
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
