"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  percentage: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
}

export default function ProgressBar({
  percentage,
  className = "",
  color = "bg-blue-500",
  showLabel = false,
}: ProgressBarProps) {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: "0%" }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.1,
          }}
        />
      </div>
      {showLabel && (
        <span className="mt-1 block text-xs text-gray-600">{clampedPercentage}% complete</span>
      )}
    </div>
  );
}
