import React from "react";

const Avatar = ({ name, size = "md" }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

    const sizeClasses = {
        sm: "w-6 h-6 text-[10px]",
        md: "w-8 h-8 text-[12px]",
        lg: "w-10 h-10 text-[14px]",
        xl: "w-12 h-12 text-[16px]"
    };

    const colors = [
        "bg-blue-600",
        "bg-purple-600",
        "bg-indigo-600",
        "bg-pink-600",
        "bg-rose-600",
        "bg-orange-600",
        "bg-emerald-600"
    ];

    // Simple hash for consistent color
    const colorIndex = name ? name.length % colors.length : 0;
    const bgColor = colors[colorIndex];

    return (
        <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center font-black text-white shadow-lg border border-white/10 shrink-0`}>
            {firstLetter}
        </div>
    );
};

export default Avatar;
