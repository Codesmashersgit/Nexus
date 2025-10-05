

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Home() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsAuthenticated(!!token);
//   }, []);

//   function handleClick() {
//     if (isAuthenticated) {
//       navigate("/dashboard");
//     } else {
//       navigate("/login");
//     }
//   }

//   return (
//     <>
//       <div className="h-screen w-full fixed bg-[#E7F99A] p-5">
//         <div className="h-full bg-[#FFFFFF] p-2 rounded-md shadow-md">
//           <div className="flex flex-col md:flex-row justify-between items-center h-full">
//             {/* Text Section */}
//             <div className="flex flex-col items-center text-center px-4 md:px-10 py-28 md:py-0 md:w-1/2">
//               <h1 className="text-3xl md:text-5xl font-bold leading-tight">
//                 Video Calls & Meetings For Everyone
//               </h1>
//               <p className="mt-6 text-lg md:text-xl font-light">
//                 Connect, Collaborate & Celebrate with Chroma Meet.
//               </p>
//               <button
//                 onClick={handleClick}
//                 className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-6 shadow-[0px_-4px_0px_0px_rgba(242,242,242,0.92)_inset,0px_1px_2px_0px_rgba(255,255,255,0.05),0px_-2px_0px_0px_rgba(255,255,255,0.25)_inset] text-[#1E1E1E] font-medium mt-5 tracking-tight hover:scale-110 transition-all ease-in-out"
//               >
//                 Start Now
//               </button>
//             </div>

//             {/* Image Section */}
//             <div className="md:w-1/2 p-4 md:flex hidden justify-center items-center">
//               <img
//                 src="https://img.freepik.com/premium-vector/illustration-cartoon-female-user-entering-login_241107-682.jpg"
//                 alt="Hero"
//                 className="w-full max-w-[400px] md:max-w-[600px] h-auto object-contain"
//               />
//             </div>
//             <div className="p-5 absolute top-[50%] lg:hidden justify-center items-center">
//               <img
//                 src="https://img.freepik.com/premium-vector/illustration-cartoon-female-user-entering-login_241107-682.jpg"
//                 alt="Hero"
//                 className="w-full max-w-[400px] md:max-w-[600px] h-auto object-contain"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default Home;

import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  function handleClick() {
    const token = localStorage.getItem("token"); // get token fresh on click
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="h-screen w-full fixed bg-[#d9a3ad] p-5">
      <div className="h-full bg-[#FFFFFF] p-2 rounded-md shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center h-full">
          {/* Text Section */}
          <div className="flex flex-col items-center text-center px-4 md:px-10 py-28 md:py-0 md:w-1/2">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Video Calls & Meetings For Everyone
            </h1>
            <p className="mt-6 text-lg md:text-xl font-light">
              Connect, Collaborate & Celebrate with Chroma Meet.
            </p>
            <button
              onClick={handleClick}
              className="border border-[#E4E4E4] rounded-[7px] bg-white py-2 px-6 shadow-[0px_-4px_0px_0px_rgba(242,242,242,0.92)_inset,0px_1px_2px_0px_rgba(255,255,255,0.05),0px_-2px_0px_0px_rgba(255,255,255,0.25)_inset] text-[#1E1E1E] font-medium mt-5 tracking-tight hover:scale-110 transition-all ease-in-out"
            >
              Start Now
            </button>
          </div>

          {/* Image Section */}
          <div className="md:w-1/2 p-4 md:flex hidden justify-center items-center">
            <img
              src="https://lh3.googleusercontent.com/gg-dl/AJfQ9KRJqOA8hliKz2KpCAlydFVPfCQsDlYKPaIUC1lejjnJ4sBzyVWrevcljCSXZoBGHiEkqFm9AV9kLixbu-RTtLHnyytRpSp4NqGxGlf3OyBn8sGuvkwN261zQ58st6GD1NCvH5qjMAb1DnxebdsFd100sUVivWd_zIsg2E6pvpU1FL7leg=s1024"
              alt="Hero"
              className="w-full max-w-[400px] md:max-w-[600px] h-[500px] object-contain"
            />
          </div>
          <div className="p-5 absolute top-[50%] lg:hidden justify-center items-center">
            <img
              src="https://img.freepik.com/premium-vector/illustration-cartoon-female-user-entering-login_241107-682.jpg"
              alt="Hero"
              className="w-full max-w-[400px] md:max-w-[600px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
