/**
 * VendorLogo — Client component with error handling for vendor logos
 */

"use client";

import { Building2 } from "lucide-react";
import { useState } from "react";

interface Props {
  logo: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { container: "h-10 w-10", icon: "h-5 w-5", text: "text-sm" },
  md: { container: "h-16 w-16", icon: "h-8 w-8", text: "text-xl" },
  lg: { container: "h-20 w-20", icon: "h-10 w-10", text: "text-2xl" },
};

const GRADIENT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-red-500 to-rose-600",
  "from-green-500 to-emerald-600",
];

export function VendorLogo({ logo, name, size = "md" }: Props) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = SIZES[size];

  // Generate initials for fallback
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Deterministic color based on vendor name
  const colorIndex = name.charCodeAt(0) % GRADIENT_COLORS.length;
  const gradientClass = GRADIENT_COLORS[colorIndex];

  if (logo && !imgError) {
    return (
      <div
        className={`relative flex ${sizeClasses.container} flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white`}
      >
        <img
          src={logo}
          alt={name}
          className="h-full w-full object-contain p-1.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex ${sizeClasses.container} flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} font-bold text-white shadow-sm ${sizeClasses.text}`}
    >
      {initials || <Building2 className={sizeClasses.icon} />}
    </div>
  );
}
