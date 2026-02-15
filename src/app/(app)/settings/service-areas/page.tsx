import { auth } from "@clerk/nextjs/server";
import { Globe, Map, MapPin, Navigation, Plus, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { PageSectionCard } from "@/components/layout/PageSectionCard";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ── Mock service area data (wire to DB later) ── */

interface ServiceArea {
  id: string;
  name: string;
  zipCodes: string[];
  cities: string[];
  activeJobs: number;
  assignedTeam: string;
  color: string;
}

const MOCK_AREAS: ServiceArea[] = [
  {
    id: "sa-1",
    name: "Downtown Phoenix",
    zipCodes: ["85003", "85004", "85006", "85007"],
    cities: ["Phoenix"],
    activeJobs: 12,
    assignedTeam: "Team Alpha",
    color: "bg-blue-500",
  },
  {
    id: "sa-2",
    name: "Scottsdale North",
    zipCodes: ["85254", "85255", "85260", "85266"],
    cities: ["Scottsdale"],
    activeJobs: 8,
    assignedTeam: "Team Bravo",
    color: "bg-emerald-500",
  },
  {
    id: "sa-3",
    name: "Tempe / Mesa",
    zipCodes: ["85281", "85282", "85201", "85202"],
    cities: ["Tempe", "Mesa"],
    activeJobs: 15,
    assignedTeam: "Team Charlie",
    color: "bg-amber-500",
  },
];

/* ── Page ── */

export default async function ServiceAreasPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const ctx = await safeOrgContext();
  if (!ctx.orgId || ctx.status !== "ok") redirect("/settings");

  const totalZips = MOCK_AREAS.reduce((sum, a) => sum + a.zipCodes.length, 0);
  const totalJobs = MOCK_AREAS.reduce((sum, a) => sum + a.activeJobs, 0);

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="settings"
        title="Service Areas & Territories"
        subtitle="Manage your organization's geographic coverage and team assignments"
        icon={<Map className="h-5 w-5" />}
        actions={
          <button className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/30">
            <Plus className="h-4 w-4" />
            Add Service Area
          </button>
        }
      />

      <div className="grid gap-6">
        {/* ─── Summary Stats ─── */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-1,white)] p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Map className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-[color:var(--text)]">{MOCK_AREAS.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Service Areas</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-1,white)] p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-[color:var(--text)]">{totalZips}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">ZIP Codes Covered</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-1,white)] p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <Navigation className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-[color:var(--text)]">{totalJobs}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Jobs</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-1,white)] p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-[color:var(--text)]">
                {new Set(MOCK_AREAS.map((a) => a.assignedTeam)).size}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Assigned Teams</div>
            </div>
          </div>
        </div>

        {/* ─── Service Areas List ─── */}
        <PageSectionCard
          title="Active Service Areas"
          subtitle="Click an area to view details and edit coverage"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_AREAS.map((area) => (
              <div
                key={area.id}
                className="group relative overflow-hidden rounded-lg border border-[color:var(--border)] bg-slate-50 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-800/50"
              >
                {/* Color bar */}
                <div className={`h-1.5 ${area.color}`} />

                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[color:var(--text)]">{area.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {area.cities.join(", ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {area.activeJobs} jobs
                    </span>
                  </div>

                  {/* ZIP Codes */}
                  <div className="mb-3">
                    <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      ZIP Codes
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {area.zipCodes.map((zip) => (
                        <span
                          key={zip}
                          className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        >
                          {zip}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="h-3 w-3" />
                    {area.assignedTeam}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </PageSectionCard>

        {/* ─── Map Placeholder ─── */}
        <PageSectionCard
          title="Coverage Map"
          subtitle="Visual overview of your service territories"
        >
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[color:var(--border)] bg-slate-50 py-16 dark:bg-slate-800/30">
            <Globe className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mb-1 font-semibold text-[color:var(--text)]">
              Interactive Map Coming Soon
            </h3>
            <p className="max-w-sm text-center text-sm text-slate-500 dark:text-slate-400">
              An interactive map view with draggable service area boundaries and real-time job
              overlays will be available in a future update.
            </p>
            <Link
              href="/settings"
              className="mt-4 rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ← Back to Settings
            </Link>
          </div>
        </PageSectionCard>
      </div>
    </PageContainer>
  );
}
