import React from "react";

import { cn } from "@/lib/utils";

interface SkeletonListProps {
  rows?: number;
  variant?: "cards" | "rows" | "grid";
  columns?: number;
}

export default function SkeletonList({
  rows = 3,
  variant = "rows",
  columns = 3,
}: SkeletonListProps) {
  if (variant === "cards") {
    return (
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid gap-6", `md:grid-cols-${columns}`)}>
        {Array.from({ length: rows * columns }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="mb-2 h-8 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border bg-white p-4">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
