import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DashboardCharts from "@/components/DashboardCharts";
import DashboardKPIs from "@/components/DashboardKPIs";
import GradientBackground from "@/components/GradientBackground";
import RecentActivity from "@/components/RecentActivity";
import MotionSection from "@/components/ui/MotionSection";
import { getRecentActivity } from "@/lib/activity";
import { getDashboardMetrics } from "@/lib/metrics";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { userId, orgId } = auth();
  if (!userId) redirect("/sign-in");

  const resolvedOrgId = orgId || userId;

  // Fetch metrics and activity
  let metrics = { totalLeads: 0, activeJobs: 0, revenue: 0, conversionRate: 0 };
  let recentActivity: any[] = [];

  if (resolvedOrgId) {
    try {
      [metrics, recentActivity] = await Promise.all([
        getDashboardMetrics(userId),
        getRecentActivity(resolvedOrgId, 6),
      ]);
    } catch (error) {
      logger.error("[dashboard] Error fetching data:", error);
    }
  }

  return (
    <div className="relative space-y-6">
      <GradientBackground />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            Welcome back! Here&apos;s your command center.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardKPIs metrics={metrics} />

      {/* Charts */}
      <DashboardCharts />

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity activities={recentActivity} />

        <MotionSection title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/leads/new"
              className="rounded-xl border border-sky-700 bg-sky-600/20 p-4 text-center transition hover:bg-sky-600/30"
            >
              <div className="mb-2 text-2xl">👤</div>
              <div className="text-sm font-medium text-sky-300">New Lead</div>
            </a>
            <a
              href="/claims/new"
              className="rounded-xl border border-sky-700 bg-sky-600/20 p-4 text-center transition hover:bg-sky-600/30"
            >
              <div className="mb-2 text-2xl">📋</div>
              <div className="text-sm font-medium text-sky-300">New Claim</div>
            </a>
            <a
              href="/weather/dol"
              className="rounded-xl border border-sky-700 bg-sky-600/20 p-4 text-center transition hover:bg-sky-600/30"
            >
              <div className="mb-2 text-2xl">🌦️</div>
              <div className="text-sm font-medium text-sky-300">Weather Pull</div>
            </a>
            <a
              href="/reports/history"
              className="rounded-xl border border-sky-700 bg-sky-600/20 p-4 text-center transition hover:bg-sky-600/30"
            >
              <div className="mb-2 text-2xl">📄</div>
              <div className="text-sm font-medium text-sky-300">Report History</div>
            </a>
          </div>
        </MotionSection>
      </div>
    </div>
  );
}
