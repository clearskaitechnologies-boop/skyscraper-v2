"use client";

import { HTMLMotionProps,motion } from "framer-motion";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      className={cn(
        // Glass effect
        "relative overflow-hidden rounded-2xl",
        "bg-white/10 backdrop-blur-xl",
        "border border-white/20",
        "shadow-xl shadow-black/5",
        
        // Dark mode
        "dark:border-slate-700/50 dark:bg-slate-900/40",
        
        // Glow effect
        glow && "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-blue-500/20 before:via-transparent before:to-purple-500/20 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
        
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
