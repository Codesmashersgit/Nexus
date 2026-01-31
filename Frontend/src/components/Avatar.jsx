import React from "react";

const Avatar = ({ name, size = "md" }) => {
    const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

    const sizeClasses = {
        sm: "w-8 h-8 text-[12px]",
        md: "w-10 h-10 text-[14px]",
        lg: "w-12 h-12 text-[16px]",
        xl: "w-14 h-14 text-[18px]"
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
        <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center font-semibold text-white shadow-lg border border-white/10 shrink-0`}>
            {firstLetter}
        </div>
    );
};

export default Avatar;
