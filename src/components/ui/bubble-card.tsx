import * as React from "react";

import { cn } from "@/lib/utils";

type BubbleCardProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean; // if true, apply hover lift
};

export function BubbleCard({ className, interactive = false, ...props }: BubbleCardProps) {
  return (
    <div
      className={cn(
        // core bubble shape
        "rounded-3xl border shadow-lg",
        "border-slate-200/80 bg-white/90 text-slate-900",
        "dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-50",
        "backdrop-blur-sm",
        // spacing
        "px-6 py-5 md:px-8 md:py-6",
        // animation
        interactive &&
          "cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
      {...props}
    />
  );
}
