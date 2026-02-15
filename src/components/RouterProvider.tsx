"use client";
import { ReactNode } from "react";

// Provide a simple wrapper that doesn't conflict with Next.js routing
// Individual pages can handle their own routing context if needed
export default function RouterProvider({ children }: { children: ReactNode }) {
  return <div className="router-context">{children}</div>;
}
