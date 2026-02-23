import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaCrown, FaArrowRight } from "react-icons/fa";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const plan = query.get("plan") || "pro";

    useEffect(() => {
        // Activate the plan in localStorage
        const expiryDate = new Date();
        if (plan === "enterprise") {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
        }

        localStorage.setItem("userPlan", JSON.stringify({
            type: plan,
            active: true,
            expiresAt: expiryDate.toISOString()
        }));
    }, [plan]);

    return (
        <div className="home-container min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="mesh-gradient">
                <div className="mesh-ball ball-1"></div>
                <div className="mesh-ball ball-2"></div>
            </div>

            <div className="relative z-10 glass-panel border-[#fa1239]/20 p-10 md:p-16 max-w-lg w-full text-center shadow-2xl animate-in zoom-in fade-in duration-700">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#fa1239]/10 blur-[80px] pointer-events-none" />

                <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <FaCheckCircle className="text-green-500 text-5xl" />
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                    Payment <span className="text-[#fa1239]">Successful!</span>
                </h1>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-10 flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Activated Plan</p>
                        <p className="text-white font-bold text-lg capitalize flex items-center gap-2">
                            <FaCrown className="text-yellow-400" /> {plan}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-green-400 font-bold uppercase tracking-wider text-sm">Active ✓</p>
                    </div>
                </div>

                <p className="text-gray-400 font-medium mb-12 leading-relaxed">
                    Welcome to the elite club! Sabhi features unlock ho chuke hain. Ab bina kisi limit ke calls enjoy karo.
                </p>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full bg-[#fa1239] hover:brightness-110 text-white font-black py-4 rounded-2xl shadow-xl shadow-[#fa1239]/20 transition-all active:scale-95 flex items-center justify-center gap-3 tracking-widest uppercase"
                >
                    Go to Dashboard <FaArrowRight />
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
