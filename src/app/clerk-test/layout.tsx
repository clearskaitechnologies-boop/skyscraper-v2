import { ReactNode } from "react";

// 🚫 Force dynamic rendering for clerk-test route
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function ClerkTestLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
