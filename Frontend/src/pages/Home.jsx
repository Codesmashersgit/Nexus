

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
    
  
          <div className="flex flex-col md:flex-row">
  {/* Text Section */}
  <div className="h-[90vh] flex-1 flex flex-col lg:items-center lg:justify-center py-28 mt-16 text-center px-4 bg-gradient-to-r from-[#ffc6d0] to-[#ffdae0]">
    <h1 className="text-3xl md:text-[70px] font-bold leading-tight">
      Video <span className="text-[#fa1239]">Calls & Meetings</span> For Everyone
    </h1>
    <p className="mt-6 text-lg md:text-xl font-light leading-8">
      Connect, Collaborate & Celebrate with Chroma Meet.
    </p>
    <button
      type="button"
      onClick={handleClick}
      className="border border-[#fa1239] rounded-[20px] py-2 px-6  text-[#1E1E1E] font-medium mt-5 tracking-tight"
    >
      Start Now
    </button>
  </div>


          {/* Image Section */}
          {/* <div className="md:w-1/2 p-4 md:flex hidden justify-center items-center">
            <img
              src=""
              alt="Hero"
              className="w-full max-w-[400px] md:max-w-[600px] h-[500px] object-contain"
            />
          </div> */}
          {/* <div className="p-5 absolute top-[50%] lg:hidden justify-center items-center">
            <img
              src="https://img.freepik.com/premium-vector/illustration-cartoon-female-user-entering-login_241107-682.jpg"
              alt="Hero"
              className="w-full max-w-[400px] md:max-w-[600px] h-auto object-contain"
            />
          </div> */}
        </div>
  );
}

export default Home;
