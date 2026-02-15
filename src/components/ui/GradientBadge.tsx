import { LucideIcon } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

interface GradientBadgeProps {
  icon: LucideIcon;
  variant?: "blue" | "purple" | "emerald" | "orange" | "pink";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const gradients = {
  blue: "from-blue-600 to-indigo-600",
  purple: "from-purple-600 to-pink-600",
  emerald: "from-emerald-600 to-teal-600",
  orange: "from-orange-600 to-red-600",
  pink: "from-pink-600 to-rose-600",
};

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

export default function GradientBadge({
  icon: Icon,
  variant = "blue",
  size = "md",
  className,
}: GradientBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-md",
        gradients[variant],
        sizes[size],
        className
      )}
    >
      <Icon className={cn("text-white", iconSizes[size])} />
    </div>
  );
}
