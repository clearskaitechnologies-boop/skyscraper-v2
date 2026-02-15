import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface OnboardingSpotlightProps {
  selector: string;
}

export const OnboardingSpotlight: React.FC<OnboardingSpotlightProps> = ({ selector }) => {
  const [dimensions, setDimensions] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const element = document.querySelector(selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setDimensions({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, [selector]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute"
      style={{
        top: dimensions.top - 8,
        left: dimensions.left - 8,
        width: dimensions.width + 16,
        height: dimensions.height + 16,
      }}
    >
      {/* Glowing Border */}
      <div className="absolute inset-0 animate-pulse rounded-lg border-4 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]" />

      {/* White Background Cutout */}
      <div className="absolute inset-0 rounded-lg bg-white/5" />
    </motion.div>
  );
};
