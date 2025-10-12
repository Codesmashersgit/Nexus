

import React from "react";
import { useNavigate } from "react-router-dom";


function Home() {
  const navigate = useNavigate();

  function handleClick() {
    const token = localStorage.getItem("authToken");
  const storedName = localStorage.getItem("username");

  if (token && storedName) {
    navigate("/dashboard");
  } else {
    navigate("/login");
  }
  }

  return (
    
  
         <div className="flex flex-col md:flex-row">
  {/* Text Section */}
  <div className="h-[91vh] w-full flex-1 flex flex-col lg:items-center lg:justify-center pt-20 lg:pt-0 mt-16 text-center px-4 relative overflow-hidden">

    <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-30 z-0" />

    <h1 className="text-3xl md:text-[70px] font-bold leading-tight z-10">
      Video <span className="text-[#fa1239]">Calls & Meetings</span> For Everyone
    </h1>
    <p className="mt-6 text-lg md:text-xl font-light leading-8 z-10">
      Connect, Collaborate & Celebrate with Nexus.
    </p>
    <button
      type="button"
      onClick={handleClick}
      className="border border-[#fa1239] rounded-[20px] py-2 px-6 text-[#1E1E1E] font-medium mt-5 tracking-tight z-10"
    >
      Start Now
    </button>
  </div>

  {/* Image Section */}
  <div className="lg:hidden">
    <img
      src="https://img.freepik.com/premium-vector/illustration-cartoon-female-user-entering-login_241107-682.jpg"
      alt="Hero"
      className="w-full max-w-[400px] md:max-w-[600px] h-auto object-contain"
    />
  </div>
</div>

  );
}

export default Home;
