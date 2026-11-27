import React from "react";
export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#grad)"/>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
      </defs>
      <text x="8" y="28" fontFamily="Outfit,sans-serif" fontWeight="700" fontSize="22" fill="white">N</text>
      <circle cx="30" cy="14" r="6" fill="rgba(255,255,255,0.15)"/>
      <path d="M28 11 L28 17 M30 10 L30 18 M32 11 L32 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
