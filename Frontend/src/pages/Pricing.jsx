import React from 'react'

const Pricing = () => {
  return (
    <div className="home-container min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="mesh-gradient">
        <div className="mesh-ball ball-1"></div>
        <div className="mesh-ball ball-2"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 tracking-tight px-4">
            Choose Your <span className="text-[#fa1239]">Plan</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed px-6">
            Elevate your collaboration with professional features tailored for every team size.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">

          {/* Free Plan */}
          <div className="glass-panel p-6 md:p-10 flex flex-col items-center text-center hover:bg-white/5 transition-all duration-500 group border-white/5">
            <h3 className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 md:mb-6">Standard</h3>
            <p className="text-4xl md:text-5xl font-black mb-2 md:mb-4 tracking-tighter text-white">₹0</p>
            <p className="text-gray-500 mb-8 md:mb-10 text-sm md:text-base font-medium">Forever free for individuals</p>
            <ul className="text-left w-full space-y-3 md:space-y-4 mb-10 md:mb-12 flex-1">
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium opacity-80">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> 40-minute meetings
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium opacity-80">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> Up to 2 participants
              </li>
            </ul>
            <button className="w-full bg-white/5 text-gray-400 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs tracking-widest uppercase cursor-not-allowed border border-white/5" disabled>
              Current Plan
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="glass-panel p-6 md:p-10 flex flex-col items-center text-center bg-white/5 border-[#fa1239]/30 shadow-2xl md:scale-110 relative z-20">
            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 bg-[#fa1239] text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
              Most Popular
            </div>
            <h3 className="text-[10px] md:text-xs font-black text-[#fa1239] uppercase tracking-[0.2em] mb-4 md:mb-6">Pro Monthly</h3>
            <p className="text-4xl md:text-5xl font-black mb-2 md:mb-4 tracking-tighter text-white">₹11</p>
            <p className="text-gray-400 mb-8 md:mb-10 text-sm md:text-base font-medium">per developer / month</p>
            <ul className="text-left w-full space-y-3 md:space-y-4 mb-10 md:mb-12 flex-1">
              <li className="flex items-center gap-3 text-xs md:text-sm text-white font-bold">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> Unlimited meeting time
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-white font-bold">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> High-res quality
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-white font-bold">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> Advanced analytics
              </li>
            </ul>
            <button className="w-full bg-[#fa1239] text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs tracking-widest uppercase hover:brightness-110 transition-all shadow-xl shadow-[#fa1239]/20">
              Subscribe Now
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="glass-panel p-6 md:p-10 flex flex-col items-center text-center hover:bg-white/5 transition-all duration-500 group border-white/5 mt-4 md:mt-0">
            <h3 className="text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 md:mb-6">Enterprise</h3>
            <p className="text-4xl md:text-5xl font-black mb-2 md:mb-4 tracking-tighter text-white">₹59</p>
            <p className="text-gray-500 mb-8 md:mb-10 text-sm md:text-base font-medium">per organization / year</p>
            <ul className="text-left w-full space-y-3 md:space-y-4 mb-10 md:mb-12 flex-1">
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium opacity-80">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> Custom domain support
              </li>
              <li className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium opacity-80">
                <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#fa1239] rounded-full"></div> 24/7 dedicated support
              </li>
            </ul>
            <button className="w-full glass-panel border-white/10 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs tracking-widest uppercase hover:bg-white/5 transition-all">
              Choose Yearly
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};



export default Pricing