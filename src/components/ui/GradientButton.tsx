"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonProps {
  glow?: boolean;
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, glow = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700",
          "hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800",
          "font-semibold text-white",
          "shadow-lg shadow-blue-500/30",
          "transition-all duration-300",
          glow && "hover:shadow-2xl hover:shadow-blue-500/50",
          className
        )}
        {...props}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "linear",
          }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export default GradientButton;
