import React from 'react'

export default function Avatar({
    name = "",
    size = 56, // px (h-14 = 56px)
    className = "",
    accent = "from-slate-400 to-slate-600",
    initials = "",
}) {
    return (
        <div
            className={`grid place-items-center rounded-2xl text-white font-semibold ${className} bg-gradient-to-br ${accent}`}
            style={{
                width: size,
                height: size,
                fontSize: size * 0.28,
            }}
        >
            {initials}
        </div>
    );
}