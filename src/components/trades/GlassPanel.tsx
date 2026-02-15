/**
 * GlassPanel Component
 * VisionOS-style glass morphism panel for Trades Network UI
 */

"use client";

import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/70 bg-card/80 shadow-xl backdrop-blur-xl",
        "bg-gradient-to-b from-card/95 via-card/90 to-muted/90",
        "dark:from-slate-900/90 dark:via-slate-900/95 dark:to-slate-950/95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
