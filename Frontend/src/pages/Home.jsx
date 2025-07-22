import React from "react";
import { Link,useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import video from "../assets/video.mp4";
import img2 from "../assets/App Business Website in Pink and Bright Blue Color Blocks Style (1).png";


function Home() {
  const navigate = useNavigate();

  const handleStartDemo = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };
  return (
    <>
      <div className="relative bg-black">
        <div className="lg:absolute flex flex-col items-center justify-center gap-6 md:mx-16 h-screen lg:w-1/2 p-2">
          <h1 className="text-2xl md:text-3xl lg:text-5xl text-purple-600 uppercase font-bold text-center md:max-w-full md:w-[90%]">
            Video call & Meeting for everyone
          </h1>

          <p className="text-base font-normal text-center text-white">
            Connect, Collaborate from anywhere with Chroma Meet
          </p>

          <div>
            
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700 transition"
                 onClick={handleStartDemo}
              >
                Start Demo
              </motion.button>
    
          </div>
        </div>

        <div className="flex flex-col items-end">
          <video
            autoPlay
            muted
            loop
            playsInline
            src={video}
            className="w-[700px] h-[100vh] object-cover border-none hidden md:block"
          />
        </div>

        <div>
          <div className="lg:absolute md:absolute absolute lg:top-[37%] md:top-[48%] top-[60%] left-6 md:left-14 text-purple-600 lg:left-12 uppercase lg:text-5xl md:text-4xl font-bold lg:w-1/2 w-1/3">
            <p className="text-center">Real-time audio/video chat</p>
          </div>

          <div className="lg:absolute md:absolute absolute lg:right-[5%] lg:top-[60%] top-[73%] md:top-[65%] md:right-28 right-12 text-purple-600 lg:text-5xl md:text-4xl font-bold lg:w-1/2 w-1/3 uppercase">
            <p className="text-center">Secure, High-Quality Video Conferencing</p>
          </div>
          <div className="lg:absolute md:absolute absolute lg:left-12 lg:top-[85%] md:top-[83%] top-[88%] md:left-20 left-6 w-1/3 lg:w-1/2 lg:text-5xl text-white uppercase font-bold md:text-4xl">
            <p className="text-center">Built for Educators, Teams & Communities</p>
          </div>
        </div>

        <img src={img2} className="md:p-10 py-1 w-full rounded-xl" />
      </div>

      {/* <Footer /> */}
    </>
  );
}

export default Home;
