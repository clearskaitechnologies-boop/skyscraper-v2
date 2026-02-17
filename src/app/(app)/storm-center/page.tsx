import {
  AlertTriangle,
  CloudLightning,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const metadata: Metadata = {
  title: "Storm Command Center | SkaiScraper",
  description:
    "Real-time overview of active claims, pending supplements, revenue pipeline, weather alerts, and material orders.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ----- Stat Card Component -----
function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "emerald" | "amber" | "red" | "purple" | "orange";
  href?: string;
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  const card = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
          {subtext && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtext}</p>}
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return card;
}

// ----- Activity Feed Item -----
function ActivityItem({
  title,
  description,
  time,
  type,
}: {
  title: string;
  description: string;
  time: string;
  type: "claim" | "supplement" | "order" | "payment" | "weather";
}) {
  const typeColors = {
    claim: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    supplement: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    order: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    weather: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${typeColors[type]}`}
      >
        {type}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <span className="shrink-0 text-xs text-slate-400">{time}</span>
    </div>
  );
}

export default async function StormCenterPage() {
  const orgCtx = await safeOrgContext();

  if (orgCtx.status === "unauthenticated") {
    redirect("/sign-in");
  }

  // Fetch storm center data from API
  let data: any = null;
  try {
    // In a real deployment this would call the Storm Center API
    // For now we use sensible defaults that show the UI structure
    data = {
      activeClaims: 0,
      pendingSupplements: 0,
      supplementsApproved: 0,
      revenuePipeline: 0,
      materialOrdersPending: 0,
      avgClaimVelocity: 0,
      recentActivity: [],
      weatherAlerts: [],
    };
  } catch {
    // Graceful degradation — show zeros
  }

  return (
    <PageContainer>
      <PageHero
        icon={<CloudLightning className="h-7 w-7" />}
        title="Storm Command Center"
        subtitle="Your real-time war room for storm season. Claims, supplements, revenue, and materials — all in one view."
      />

      {/* KPI Cards Row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Active Claims"
          value={data?.activeClaims ?? 0}
          subtext="In progress"
          icon={FileText}
          color="blue"
          href="/claims"
        />
        <StatCard
          label="Pending Supplements"
          value={data?.pendingSupplements ?? 0}
          subtext="Awaiting carrier"
          icon={AlertTriangle}
          color="amber"
          href="/supplements"
        />
        <StatCard
          label="Supplements Approved"
          value={data?.supplementsApproved ?? 0}
          subtext="This month"
          icon={TrendingUp}
          color="emerald"
          href="/supplements"
        />
        <StatCard
          label="Revenue Pipeline"
          value={`$${((data?.revenuePipeline ?? 0) / 1000).toFixed(0)}k`}
          subtext="Open claims value"
          icon={DollarSign}
          color="purple"
          href="/finance/overview"
        />
        <StatCard
          label="Material Orders"
          value={data?.materialOrdersPending ?? 0}
          subtext="Pending delivery"
          icon={Package}
          color="orange"
          href="/vendors/orders"
        />
        <StatCard
          label="Claim Velocity"
          value={`${data?.avgClaimVelocity ?? 0}d`}
          subtext="Avg. close time"
          icon={CloudLightning}
          color="red"
        />
      </div>

      {/* Two-column layout: Activity Feed + Weather Alerts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              Recent Activity
            </h2>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.map((item: any, idx: number) => (
                  <ActivityItem key={idx} {...item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CloudLightning className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No recent activity
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Create your first claim or upload damage photos to get started
                </p>
                <Link
                  href="/claims"
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Create Claim
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Weather Alerts + Quick Actions */}
        <div className="space-y-6">
          {/* Weather Alerts Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              ⛈️ Weather Alerts
            </h2>
            {data?.weatherAlerts && data.weatherAlerts.length > 0 ? (
              <div className="space-y-3">
                {data.weatherAlerts.map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20"
                  >
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                      {alert.title}
                    </p>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No active weather alerts in your service area
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h2>
            <div className="grid gap-2">
              {[
                { label: "New Claim", href: "/claims" },
                { label: "Generate Supplement", href: "/ai/tools/supplement" },
                { label: "Verify Weather", href: "/quick-dol" },
                { label: "Estimate Materials", href: "/materials/estimator" },
                { label: "View Reports", href: "/reports/hub" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm font-medium text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-900/20"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
