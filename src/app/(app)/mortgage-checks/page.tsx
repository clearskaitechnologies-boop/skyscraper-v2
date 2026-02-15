import { Banknote, Building2, CheckCircle2, Clock } from "lucide-react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { guarded } from "@/lib/buildPhase";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

import MortgageCheckForm from "./MortgageCheckForm";

export const dynamic = "force-dynamic";

const statusSteps = ["pending", "received", "endorsed", "deposited", "cleared"];

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  received: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  endorsed: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  deposited: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  cleared: "bg-green-500/20 text-green-600 dark:text-green-400",
  returned: "bg-red-500/20 text-red-600 dark:text-red-400",
};

export default async function MortgageChecksPage() {
  const ctx = await safeOrgContext();
  if (ctx.status === "unauthenticated") redirect("/sign-in");
  if (ctx.status !== "ok" || !ctx.orgId) redirect("/dashboard");

  const checks = await guarded(
    "mortgage-checks",
    async () => {
      try {
        const data = await prisma.mortgage_checks.findMany({
          where: { orgId: ctx.orgId! },
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            claims: { select: { id: true, claimNumber: true, title: true, insured_name: true } },
          },
        });
        return data.map((c) => ({
          id: c.id,
          claimNumber: c.claims?.claimNumber ?? "—",
          claimTitle: c.claims?.title ?? "—",
          insuredName: c.claims?.insured_name ?? null,
          checkNumber: c.checkNumber,
          amount: Number(c.amount),
          lender: c.lender,
          status: c.status,
          expectedDate: c.expectedDate?.toISOString().split("T")[0] ?? null,
          receivedDate: c.receivedDate?.toISOString().split("T")[0] ?? null,
          clearedDate: c.clearedDate?.toISOString().split("T")[0] ?? null,
          notes: c.notes,
          createdAt: c.createdAt.toISOString().split("T")[0],
        }));
      } catch (err) {
        console.error("[mortgage-checks] DB query failed:", err);
        return [];
      }
    },
    []
  );

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalAmount = checks.reduce((s, c) => s + c.amount, 0);
  const cleared = checks.filter((c) => c.status === "cleared");
  const pending = checks.filter((c) => c.status === "pending");
  const totalCleared = cleared.reduce((s, c) => s + c.amount, 0);
  const totalPending = pending.reduce((s, c) => s + c.amount, 0);

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        section="jobs"
        title="Mortgage Check Tracker"
        subtitle="Track mortgage company checks through endorsement and deposit"
        icon={<Banknote className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <Banknote className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Total Checks</span>
          </div>
          <div className="text-3xl font-bold text-[color:var(--text)]">{checks.length}</div>
          <div className="mt-1 text-xs text-slate-500">{fmt(totalAmount)} total</div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Pending</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {pending.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">{fmt(totalPending)}</div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">In Process</span>
          </div>
          <div className="text-3xl font-bold text-[color:var(--text)]">
            {checks.filter((c) => ["received", "endorsed", "deposited"].includes(c.status)).length}
          </div>
        </div>
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-5 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-sm text-slate-600 dark:text-slate-300">Cleared</span>
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {cleared.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">{fmt(totalCleared)}</div>
        </div>
      </div>

      {/* Add form */}
      <MortgageCheckForm />

      {/* Checks table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase text-slate-500">
                <th className="px-6 py-3">Claim</th>
                <th className="px-6 py-3">Lender</th>
                <th className="px-6 py-3">Check #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Progress</th>
                <th className="px-6 py-3">Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {checks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No mortgage checks tracked yet.
                  </td>
                </tr>
              )}
              {checks.map((c) => {
                const stepIdx = statusSteps.indexOf(c.status);
                return (
                  <tr key={c.id} className="transition-colors hover:bg-[var(--surface-1)]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[color:var(--text)]">{c.claimNumber}</div>
                      <div className="text-xs text-slate-500">{c.insuredName || c.claimTitle}</div>
                    </td>
                    <td className="px-6 py-4 text-[color:var(--text)]">{c.lender}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{c.checkNumber || "—"}</td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-[color:var(--text)]">
                      {fmt(c.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[c.status] || ""}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {statusSteps.map((step, i) => (
                          <div key={step} className="flex items-center gap-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                i <= stepIdx
                                  ? "bg-[var(--primary)]"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                              title={step}
                            />
                            {i < statusSteps.length - 1 && (
                              <div
                                className={`h-0.5 w-3 ${i < stepIdx ? "bg-[var(--primary)]" : "bg-slate-300 dark:bg-slate-600"}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{c.expectedDate || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
