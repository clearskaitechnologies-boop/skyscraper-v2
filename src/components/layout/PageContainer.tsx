import { ReactNode } from "react";

import { PAGE_BG, PAGE_MAX_WIDTH } from "@/config/designSystem";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "5xl" | "6xl" | "7xl" | "full";
}

export function PageContainer({ children, className, maxWidth = "6xl" }: PageContainerProps) {
  const maxWidthClass = PAGE_MAX_WIDTH[maxWidth];

  return (
    <div className={cn(PAGE_BG, "px-4 pb-10 pt-6 md:px-6", className)}>
      <div className={cn("mx-auto space-y-4", maxWidthClass)}>{children}</div>
    </div>
  );
}
