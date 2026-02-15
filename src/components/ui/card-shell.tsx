import * as React from "react";

import { cn } from "@/lib/utils";

export function CardShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card px-6 py-5 shadow-sm backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
