"use client";

import { useId } from "react";

/**
 * SkaiScraper Logo Icon – inline SVG React component.
 * Golden roof swoosh + blue glass skyscraper, transparent background.
 * Drop-in replacement for all `<Image src="/brand/...">` logo references.
 * Uses React useId() so multiple instances on the same page don't collide.
 */
export function SkaiLogo({ size = 36, className }: { size?: number; className?: string }) {
  const uid = useId();
  const gradientId = `skaiTower-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SkaiScraper logo"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="18"
          y1="6"
          x2="42"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5BC0F8" />
          <stop offset="40%" stopColor="#2E90D9" />
          <stop offset="100%" stopColor="#1565A8" />
        </linearGradient>
      </defs>

      {/* Blue Glass Building */}
      <rect x="18" y="6" width="24" height="38" rx="2" fill={`url(#${gradientId})`} />

      {/* Windows – 3 cols × 7 rows */}
      {[10, 15, 20, 25, 30, 35, 40].map((y) => (
        <g key={y}>
          <rect x="21" y={y} width="5" height="3" rx="0.75" fill="#1B3A5C" opacity="0.65" />
          <rect x="28" y={y} width="4" height="3" rx="0.75" fill="#1B3A5C" opacity="0.65" />
          <rect x="34" y={y} width="5" height="3" rx="0.75" fill="#1B3A5C" opacity="0.65" />
        </g>
      ))}

      {/* Glass seams */}
      <line x1="27" y1="7" x2="27" y2="43.5" stroke="#3A8DD4" strokeWidth="0.3" opacity="0.35" />
      <line x1="33" y1="7" x2="33" y2="43.5" stroke="#3A8DD4" strokeWidth="0.3" opacity="0.35" />

      {/* Spire */}
      <rect x="29" y="2" width="2" height="5" rx="1" fill="#B0BEC5" />
      <circle cx="30" cy="1.5" r="1.2" fill="#FFC838" />

      {/* Golden roof swoosh */}
      <path
        d="M4 34 Q12 24 18 16"
        stroke="#FFC838"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M8 38 Q14 30 18 22"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* Light reflection */}
      <rect x="18" y="6" width="6" height="38" rx="2" fill="white" opacity="0.07" />
    </svg>
  );
}

export default SkaiLogo;
