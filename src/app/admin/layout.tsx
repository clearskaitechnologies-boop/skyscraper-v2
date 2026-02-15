import { ReactNode } from "react";

// 🚫 CRITICAL: Force 100% dynamic rendering for ALL admin routes
// This prevents Next.js from trying to static-analyze admin pages at build time
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
