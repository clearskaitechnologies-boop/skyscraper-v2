import { MetricsClient } from "./metrics-client";

// 🚫 CRITICAL: Force 100% dynamic rendering - NO static analysis at build time
export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default function AdminMetricsPage() {
  return <MetricsClient />;
}
