import { Calendar, Clock, HardHat, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { guarded } from "@/lib/buildPhase";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

import { CrewCalendar } from "./CrewCalendar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Crew Manager | SkaiScraper",
  description: "Manage crew assignments, schedules, and labor coordination.",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  in_progress: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  completed: "bg-green-500/20 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/20 text-red-600 dark:text-red-400",
};

export default async function CrewsPage() {
  const ctx = await safeOrgContext();
  if (ctx.status === "unauthenticated") redirect("/sign-in");
  if (ctx.status !== "ok" || !ctx.orgId) redirect("/dashboard");

  const schedules = await guarded(
    "crews",
    async () => {
      const data = await prisma.crewSchedule.findMany({
        where: { orgId: ctx.orgId! },
        orderBy: { scheduledDate: "asc" },
        take: 100,
        include: {
          claims: { select: { id: true, claimNumber: true, title: true } },
          users: { select: { id: true, name: true, email: true, headshot_url: true } },
        },
      });

      const allMemberIds = [...new Set(data.flatMap((s) => s.crewMemberIds))];
      const members =
        allMemberIds.length > 0
          ? await prisma.users.findMany({
              where: { id: { in: allMemberIds } },
              select: { id: true, name: true, headshot_url: true },
            })
          : [];
      const membersMap = new Map(members.map((m) => [m.id, m]));

      return data.map((s) => ({
        id: s.id,
        claimNumber: (s as any).claims?.claimNumber ?? "—",
        claimTitle: (s as any).claims?.title ?? "—",
        crewLead: (s as any).users,
        crewMembers: (s.crewMemberIds as string[]).map(
          (id) => membersMap.get(id) ?? { id, name: null, headshot_url: null }
        ),
        scheduledDate: (s.scheduledDate as Date).toISOString().split("T")[0],
        startTime: s.startTime as string | null,
        estimatedDuration: s.estimatedDuration as unknown as string | null,
        complexity: s.complexity as string | null,
        status: s.status as string,
        scopeOfWork: s.scopeOfWork as string | null,
        weatherRisk: s.weatherRisk as string | null,
      })) as any[];
    },
    []
  );

  const summary = {
    total: schedules.length,
    scheduled: schedules.filter((s) => s.status === "scheduled").length,
    inProgress: schedules.filter((s) => s.status === "in_progress").length,
    completed: schedules.filter((s) => s.status === "completed").length,
  };

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        title="Crew Manager"
        subtitle="Schedule crews, track availability, and manage labor assignments"
        icon={<HardHat className="h-5 w-5" />}
        section="trades"
      >
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <Link href="/claims">
              <Calendar className="mr-2 h-4 w-4" />
              View Claims
            </Link>
          </Button>
        </div>
      </PageHero>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Scheduled",
            value: summary.total,
            icon: <Calendar className="h-5 w-5 text-blue-500" />,
          },
          {
            label: "Upcoming",
            value: summary.scheduled,
            icon: <Clock className="h-5 w-5 text-yellow-500" />,
          },
          {
            label: "In Progress",
            value: summary.inProgress,
            icon: <HardHat className="h-5 w-5 text-orange-500" />,
          },
          {
            label: "Completed",
            value: summary.completed,
            icon: <Users className="h-5 w-5 text-green-500" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl"
          >
            <div className="mb-2 flex items-center gap-2">
              {stat.icon}
              <span className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-[color:var(--text)]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Production Calendar */}
      <CrewCalendar schedules={schedules} />

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedules.length === 0 && (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-12 text-center backdrop-blur-xl">
            <HardHat className="mx-auto mb-3 h-12 w-12 text-slate-400" />
            <p className="text-slate-500">
              No crew schedules yet. Use the API to create crew assignments.
            </p>
          </div>
        )}
        {schedules.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl transition-all hover:border-[color:var(--border-bright)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[s.status] || ""}`}
                  >
                    {s.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-slate-400">{s.complexity} complexity</span>
                  {s.weatherRisk && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ {s.weatherRisk}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--text)]">
                  {s.claimTitle}{" "}
                  <span className="text-sm font-normal text-slate-500">({s.claimNumber})</span>
                </h3>
                {s.scopeOfWork && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{s.scopeOfWork}</p>
                )}
              </div>

              <div className="space-y-1 text-right">
                <div className="flex items-center gap-2 text-sm text-[color:var(--text)]">
                  <Calendar className="h-4 w-4" /> {s.scheduledDate}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" /> {s.startTime} · {s.estimatedDuration}h
                </div>
              </div>
            </div>

            {/* Crew Members */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-medium uppercase text-slate-500">Crew Lead:</span>
              <div className="flex items-center gap-2">
                {s.crewLead?.headshot_url ? (
                  <img
                    src={s.crewLead.headshot_url}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                    {(s.crewLead?.name || "?")[0]}
                  </div>
                )}
                <span className="text-sm text-[color:var(--text)]">
                  {s.crewLead?.name || "Unknown"}
                </span>
              </div>

              {s.crewMembers.length > 0 && (
                <>
                  <span className="ml-4 text-xs text-slate-400">Members:</span>
                  <div className="flex -space-x-2">
                    {s.crewMembers.slice(0, 5).map((m) => (
                      <div
                        key={m.id}
                        title={m.name || m.id}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface-glass)] bg-[var(--surface-2)] text-xs font-bold text-[color:var(--text)]"
                      >
                        {(m.name || "?")[0]}
                      </div>
                    ))}
                    {s.crewMembers.length > 5 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--surface-glass)] bg-[var(--surface-2)] text-xs text-slate-400">
                        +{s.crewMembers.length - 5}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
