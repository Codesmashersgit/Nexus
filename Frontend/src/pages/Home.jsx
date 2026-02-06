import React from "react";
import { useNavigate } from "react-router-dom";
import { FiVideo, FiShield, FiZap, FiUserPlus, FiLink, FiArrowRight, FiCheck, FiMail, FiGithub, FiLinkedin } from "react-icons/fi";
import "./Home.css";
import logoImg from "../assets/Group.png";

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
    <div className="home-container overflow-hidden">
      {/* Dynamic Background */}
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      {/* Main Content Wrapper */}
      {/* Main Content Wrapper */}
      <section className="relative z-10 container mx-auto px-4 md:px-6 pt-24 md:pt-32 lg:pt-48 pb-12 md:pb-20">

        {/* Centered Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 md:mb-32">
          <h1 className="hero-title fade-up mb-6 md:mb-10 leading-[1.15] md:leading-[1.1] tracking-tight text-4xl sm:text-5xl md:text-7xl lg:text-8xl">
            Experience the Future of <br />
            <span className="gradient-text">Video Collaboration</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 mb-10 md:mb-14 max-w-3xl mx-auto fade-up delay-1 leading-relaxed font-medium px-2">
            Connect with your team instantly from anywhere in the world.
            Crystal clear quality, zero latency, and end-to-end security
            built for modern professionals.
          </p>

          <div className="flex flex-col items-center gap-8 md:gap-10 fade-up delay-2">
            <button
              type="button"
              onClick={handleClick}
              className="btn-premium w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 text-lg md:text-xl group shadow-[0_20px_50px_rgba(250,18,57,0.3)] whitespace-nowrap"
            >
              Start Your First Meeting
              <FiArrowRight className="inline-block transition-transform group-hover:translate-x-2 ml-3 shrink-0" />
            </button>

            <div className="flex flex-col items-center gap-4">
              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 md:h-12 md:w-12 rounded-full ring-2 md:ring-4 ring-[#050505]"
                    src={`https://i.pravatar.cc/150?u=${i + 20}`}
                    alt="User"
                  />
                ))}
                <div className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-800 ring-2 md:ring-4 ring-[#050505] text-[10px] md:text-xs font-black text-white">
                  +2k
                </div>
              </div>
              <span className="text-[10px] md:text-sm text-gray-500 font-black tracking-widest uppercase px-4 text-center">Trusted by 2000+ professionals</span>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 border-t border-white/5 pt-20 fade-up delay-3">
          <div className="glass-panel p-8 hover:bg-white/5 transition-colors group cursor-default text-center">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <FiVideo className="text-2xl text-[#fa1239]" />
            </div>
            <h3 className="text-xl font-bold mb-3">HD Video Quality</h3>
            <p className="text-gray-400">Crystal clear video and audio, even on low bandwidth connections.</p>
          </div>
          <div className="glass-panel p-8 hover:bg-white/5 transition-colors group cursor-default text-center">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <FiShield className="text-2xl text-[#fa1239]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Meetings</h3>
            <p className="text-gray-400">Enterprise-grade security with end-to-end encryption for all calls.</p>
          </div>
          <div className="glass-panel p-8 hover:bg-white/5 transition-colors group cursor-default text-center">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform">
              <FiZap className="text-2xl text-[#fa1239]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Live Collaboration</h3>
            <p className="text-gray-400">Share your screen, documents, and chat in real-time effortlessly.</p>
          </div>
        </div>

        {/* How it Works Section */}
        <section className="mt-40 mb-32 fade-up">
          <div className="text-center mb-20">
            <span className="section-tag">Process</span>
            <h2 className="text-4xl md:text-5xl font-bold">Start Meeting in <span className="text-[#fa1239]">Seconds</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 step-container">
            {[
              { icon: <FiUserPlus />, title: "Sign Up", desc: "Create your account in seconds using Google or Email." },
              { icon: <FiLink />, title: "Create & Share", desc: "Generate a room link and share it with your team." },
              { icon: <FiCheck />, title: "Collaborate", desc: "Enjoy high-quality video, chat, and screen sharing." }
            ].map((step, idx) => (
              <div key={idx} className="step-card glass-panel group">
                <div className="step-number-pill">STEP {idx + 1}</div>
                <div className="step-icon-wrapper">{step.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed max-w-[250px] mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="my-40 p-12 lg:p-20 glass-panel text-center relative overflow-hidden fade-up">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#fa1239] to-transparent"></div>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to <span className="text-[#fa1239]">Elevate</span> Your <br className="hidden md:block" /> Collaboration?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join thousands of professionals who trust Nexus for their daily meetings.</p>
          <button onClick={handleClick} className="btn-premium px-12 py-5 text-xl group">
            Start Your First Meeting
            <FiArrowRight className="inline-block ml-3 transition-transform group-hover:translate-x-2" />
          </button>
        </section>

        {/* Footer */}
        <footer className="footer-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-1 footer-brand-section">
              <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                <img src={logoImg} alt="Nexus" className="w-10" />
                <h1 className="text-2xl font-bold tracking-tight">
                  Ne<span className="text-[#fa1239]">xu</span>s
                </h1>
              </div>
              <p className="text-gray-500 leading-relaxed text-center lg:text-left">
                Building the next generation of professional communication tools with focus on speed and aesthetics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-3 gap-12 sm:text-left text-center">
              <div className="flex flex-col items-center lg:items-start">
                <h4 className="footer-nav-title">Product</h4>
                <button onClick={handleClick} className="footer-link">Video Meetings</button>
                <a href="#features" className="footer-link">Screen Sharing</a>
                <a href="#features" className="footer-link">Security</a>
              </div>
              <div>
                <h4 className="footer-nav-title">Connect</h4>
                <div className="flex flex-col gap-4 items-center lg:items-start mt-2">
                  <a href="mailto:sudhanshu.ok1802@gmail.com" className="footer-link flex items-center gap-2">
                    <FiMail className="text-[#fa1239]" /> sudhanshu.ok1802@gmail.com
                  </a>
                  <div className="flex gap-4">
                    <a href="https://github.com/Codesmashersgit/Nexus" target="_blank" rel="noopener noreferrer" className="social-pill flex items-center gap-2">
                      <FiGithub /> GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/sudhanshu-raj-45b205250" target="_blank" rel="noopener noreferrer" className="social-pill flex items-center gap-2">
                      <FiLinkedin /> LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="copyright-text text-center md:text-left w-full md:w-auto text-[10px] md:text-xs">© 2026 NEXUS MEETINGS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8 justify-center md:justify-end w-full md:w-auto">
              <a href="#" className="text-[10px] tracking-widest text-gray-600 hover:text-white transition-colors">PRIVACY POLICY</a>
              <a href="#" className="text-[10px] tracking-widest text-gray-600 hover:text-white transition-colors">TERMS OF SERVICE</a>
            </div>
          </div>
        </footer>
      </section>

      {/* Background Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#fa1239]/5 to-transparent pointer-events-none"></div>
    </div>
  );
}

export default Home;
