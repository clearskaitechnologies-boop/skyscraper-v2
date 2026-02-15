import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "5xl" | "6xl" | "7xl" | "full";
}

export function PageContainer({ children, className, maxWidth = "6xl" }: PageContainerProps) {
  const maxWidthClass = {
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div
      className={cn(
        "min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#f1f3f6] via-[#eef1f5] to-[#f1f3f6] px-4 pb-10 pt-6 md:px-6",
        className
      )}
    >
      <div className={cn("mx-auto space-y-4", maxWidthClass)}>{children}</div>
    </div>
  );
}
