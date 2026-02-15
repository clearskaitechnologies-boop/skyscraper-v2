import { Activity, AlertCircle, FileText, TrendingUp, Users } from "lucide-react";

import GlassCard from "@/components/ui/GlassCard";
import { getOrg } from "@/lib/org/getOrg";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ActivityPage() {
  const orgCtx = await getOrg({ mode: "required" });
  // If we get here, org exists (mode: "required" redirects if no org)
  if (!orgCtx.ok) throw new Error("Unreachable: mode required should redirect");
  const orgId = orgCtx.orgId;
  let recentClaims: any[] = [];
  let recentLeads: any[] = [];
  let recentReports: any[] = [];
  let recentInspections: any[] = [];
  try {
    [recentClaims, recentLeads, recentReports, recentInspections] = await Promise.all([
      prisma.claims.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, claimNumber: true, status: true, createdAt: true, damageType: true },
      }),
      prisma.leads.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, stage: true, createdAt: true },
      }),
      prisma.ai_reports.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, type: true, createdAt: true, status: true },
      }),
      prisma.inspections.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, type: true, createdAt: true, status: true },
      }),
    ]);
  } catch (err: any) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-xl border border-[color:var(--border)] p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Activity Feed Error</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {err?.message?.includes("Unknown field")
              ? "Schema mismatch detected – feed temporarily unavailable."
              : "Failed to load recent activity."}
          </p>
        </div>
      </div>
    );
  }

  type ActivityItem = {
    id: string;
    title: string;
    timestamp: string;
    icon: string;
    createdAt: Date;
  };

  const activities: ActivityItem[] = [];

  function formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  recentClaims.forEach((claim) => {
    activities.push({
      id: `claim-${claim.id}`,
      title: `Claim ${claim.claimNumber || "#" + claim.id.slice(0, 8)} - ${claim.damageType || claim.status}`,
      timestamp: formatTimestamp(claim.createdAt),
      icon: "FileText",
      createdAt: claim.createdAt,
    });
  });

  recentLeads.forEach((lead) => {
    activities.push({
      id: `lead-${lead.id}`,
      title: `Lead activity - stage ${lead.stage}`,
      timestamp: formatTimestamp(lead.createdAt),
      icon: "Users",
      createdAt: lead.createdAt,
    });
  });

  recentReports.forEach((report) => {
    activities.push({
      id: `report-${report.id}`,
      title: `Generated ${report.type} report - ${report.status}`,
      timestamp: formatTimestamp(report.createdAt),
      icon: "TrendingUp",
      createdAt: report.createdAt,
    });
  });

  recentInspections.forEach((inspection) => {
    activities.push({
      id: `inspection-${inspection.id}`,
      title: `${inspection.type} inspection - ${inspection.status}`,
      timestamp: formatTimestamp(inspection.createdAt),
      icon: "Activity",
      createdAt: inspection.createdAt,
    });
  });

  activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[color:var(--text)]">Recent Activity</h2>
        <p className="mt-1 text-slate-700 dark:text-slate-300">
          Track your team's latest actions and updates
        </p>
      </div>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <GlassCard key={activity.id}>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
                  {activity.icon === "FileText" && <FileText className="h-5 w-5 text-white" />}
                  {activity.icon === "TrendingUp" && <TrendingUp className="h-5 w-5 text-white" />}
                  {activity.icon === "Users" && <Users className="h-5 w-5 text-white" />}
                  {activity.icon === "Activity" && <Activity className="h-5 w-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[color:var(--text)]">{activity.title}</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <GlassCard>
            <p className="py-8 text-center text-slate-700 dark:text-slate-300">
              No recent activity
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
