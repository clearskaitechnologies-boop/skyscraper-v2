"use client";
import { ReactNode, Suspense } from "react";

export function AsyncBoundary({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <Suspense fallback={fallback || <div className="p-4 text-sm">Loading…</div>}>{children}</Suspense>;
}
