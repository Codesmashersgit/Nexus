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

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 lg:pt-36 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">

            <h1 className="hero-title fade-up mb-8">
              Experience the Future of <br />
              <span className="gradient-text">Video Collaboration</span>
            </h1>

            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 fade-up delay-1 leading-relaxed">
              Connect with your team instantly from anywhere in the world.
              Crystal clear quality, zero latency, and end-to-end security
              built for modern professionals.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start fade-up delay-2">
              <button
                type="button"
                onClick={handleClick}
                className="btn-premium group"
              >
                Start for Free
                <span className="inline-block transition-transform group-hover:translate-x-1 ml-2">→</span>
              </button>

              <div className="flex -space-x-3 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#050505]"
                    src={`https://i.pravatar.cc/150?u=${i + 20}`}
                    alt="User"
                  />
                ))}
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-800 ring-2 ring-[#050505] text-xs font-medium text-white">
                  +2k
                </div>
                <span className="ml-4 text-sm text-gray-400 pt-2 font-medium">Trusted by 2000+ users</span>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Teaser */}
          <div className="flex-[1.2] relative fade-up delay-2 w-full max-w-5xl mx-auto lg:mx-0">
            <div className="visual-teaser glass-panel overflow-hidden shadow-2xl border-white/10 p-0">
              <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-black/20 rounded-md text-[10px] text-gray-500 font-mono tracking-wider">
                  nexus-meeting.app/live-sync
                </div>
                <div className="w-10"></div>
              </div>
              <img
                src="/nexus-hero.png"
                alt="Nexus Interface"
                className="w-full h-[250px] sm:h-[350px] lg:h-[400px] object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
              />

              {/* Floating Feature Tags */}
              <div className="absolute top-1/2 -right-8 glass-panel py-3 px-5 animate-bounce shadow-xl hidden md:block" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-3">
                  <FiZap className="text-yellow-400" />
                  <span className="text-sm font-semibold">4K Ultra HD</span>
                </div>
              </div>

              <div className="absolute bottom-1/4 -left-12 glass-panel py-3 px-5 animate-bounce shadow-xl hidden md:block" style={{ animationDuration: '5s' }}>
                <div className="flex items-center gap-3">
                  <FiShield className="text-green-400" />
                  <span className="text-sm font-semibold">End-to-End Encrypted</span>
                </div>
              </div>
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
              <div>
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
            <p className="copyright-text">© 2026 NEXUS MEETINGS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
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
