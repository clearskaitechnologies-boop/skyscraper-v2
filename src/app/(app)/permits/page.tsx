import { AlertCircle, CheckCircle2, ClipboardList, Clock, FileCheck, Shield } from "lucide-react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { guarded } from "@/lib/buildPhase";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

import PermitForm from "./PermitForm";

export const dynamic = "force-dynamic";

const statusIcons: Record<string, any> = {
  applied: <Clock className="h-4 w-4 text-blue-500" />,
  approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  issued: <FileCheck className="h-4 w-4 text-emerald-500" />,
  inspection_scheduled: <ClipboardList className="h-4 w-4 text-yellow-500" />,
  passed: <Shield className="h-4 w-4 text-green-600" />,
  failed: <AlertCircle className="h-4 w-4 text-red-500" />,
  expired: <AlertCircle className="h-4 w-4 text-slate-400" />,
};

const statusColors: Record<string, string> = {
  applied: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  approved: "bg-green-500/20 text-green-600 dark:text-green-400",
  issued: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  inspection_scheduled: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  passed: "bg-green-600/20 text-green-700 dark:text-green-300",
  failed: "bg-red-500/20 text-red-600 dark:text-red-400",
  expired: "bg-slate-500/20 text-slate-600 dark:text-slate-300",
};

export default async function PermitsPage() {
  const ctx = await safeOrgContext();
  if (ctx.status === "unauthenticated") redirect("/sign-in");
  if (ctx.status !== "ok" || !ctx.orgId) redirect("/dashboard");

  const permits = await guarded(
    "permits",
    async () => {
      const data = await prisma.permits.findMany({
        where: { orgId: ctx.orgId! },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return data.map((p) => ({
        id: p.id,
        permitNumber: p.permitNumber,
        permitType: p.permitType,
        jurisdiction: p.jurisdiction,
        status: p.status,
        appliedAt: p.appliedAt.toISOString().split("T")[0],
        expiresAt: p.expiresAt?.toISOString().split("T")[0] ?? null,
        inspectionDate: p.inspectionDate?.toISOString().split("T")[0] ?? null,
        fee: p.fee ? Number(p.fee) : null,
        notes: p.notes,
      }));
    },
    []
  );

  const summary = {
    total: permits.length,
    active: permits.filter((p) => !["passed", "failed", "expired"].includes(p.status)).length,
    pendingInspection: permits.filter((p) => p.status === "inspection_scheduled").length,
    passed: permits.filter((p) => p.status === "passed").length,
  };

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="jobs"
        title="Permit Tracker"
        subtitle="Track building permits, inspections, and approvals for your jobs"
        icon={<ClipboardList className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: summary.total, color: "blue" },
          { label: "Active", value: summary.active, color: "green" },
          { label: "Pending Inspection", value: summary.pendingInspection, color: "yellow" },
          { label: "Passed", value: summary.passed, color: "emerald" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl"
          >
            <div className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</div>
            <div className="mt-1 text-3xl font-bold text-[color:var(--text)]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Add permit form */}
      <PermitForm />

      {/* Permits table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase text-slate-500">
                <th className="px-6 py-3">Permit #</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Jurisdiction</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Applied</th>
                <th className="px-6 py-3">Inspection</th>
                <th className="px-6 py-3 text-right">Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {permits.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No permits tracked yet. Add your first permit above.
                  </td>
                </tr>
              )}
              {permits.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-[var(--surface-1)]">
                  <td className="px-6 py-4 font-mono font-medium text-[color:var(--primary)]">
                    {p.permitNumber}
                  </td>
                  <td className="px-6 py-4 capitalize text-[color:var(--text)]">{p.permitType}</td>
                  <td className="px-6 py-4 text-[color:var(--text)]">{p.jurisdiction || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[p.status] || ""}`}
                    >
                      {statusIcons[p.status]} {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.appliedAt}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.inspectionDate || "—"}</td>
                  <td className="px-6 py-4 text-right font-mono text-[color:var(--text)]">
                    {p.fee ? `$${p.fee.toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
