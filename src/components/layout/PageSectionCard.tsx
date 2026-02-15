import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageSectionCardProps {
  title?: string;
  subtitle?: string;
  interactive?: boolean;
  noPadding?: boolean;
  children: ReactNode;
  className?: string;
}

export function PageSectionCard({
  title,
  subtitle,
  interactive = false,
  noPadding = false,
  children,
  className,
}: PageSectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
        interactive && "transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md",
        !noPadding && "p-4 md:p-5",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-base font-semibold md:text-lg">{title}</h2>}
          {subtitle && <p className="mt-1 text-xs text-slate-600 md:text-sm">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
