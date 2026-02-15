/**
 * Templates Section Layout
 * Simple pass-through layout - auth is handled by middleware
 * This ensures all templates routes render within the app shell
 */

import { ReactNode } from "react";

interface TemplatesLayoutProps {
  children: ReactNode;
}

export default function TemplatesLayout({ children }: TemplatesLayoutProps) {
  // App shell (sidebar/topbar) is provided by parent (app) layout
  // Middleware handles public vs protected route logic
  return <>{children}</>;
}
