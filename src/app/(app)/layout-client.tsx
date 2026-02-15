"use client";

import { ReactNode } from "react";

import { ErrorBoundary } from "@/components/system/ErrorBoundary";

/**
 * Client-side layout wrapper that provides error boundary protection
 * for all authenticated app routes
 */
export function AppLayoutClient({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
