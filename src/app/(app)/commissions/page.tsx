import { BadgeDollarSign, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { guarded } from "@/lib/buildPhase";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

import CommissionActions from "./CommissionActions";

export const dynamic = "force-dynamic";

export default async function CommissionsPage() {
  const ctx = await safeOrgContext();
  if (ctx.status === "unauthenticated") redirect("/sign-in");
  if (ctx.status !== "ok" || !ctx.orgId) redirect("/dashboard");

  const records = await guarded(
    "commissions",
    async () => {
      try {
        const data = await prisma.team_performance.findMany({
          where: { orgId: ctx.orgId! },
          orderBy: { createdAt: "desc" },
          take: 100,
        });
        const userIds = [...new Set(data.map((r) => r.userId))];
        const users = await prisma.users.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true, headshot_url: true },
        });
        const usersMap = new Map(users.map((u) => [u.id, u]));
        return data.map((r) => ({
          id: r.id,
          userId: r.userId,
          user: usersMap.get(r.userId) ?? null,
          periodStart: r.periodStart.toISOString().split("T")[0],
          periodEnd: r.periodEnd.toISOString().split("T")[0],
          claimsSigned: r.claimsSigned,
          claimsApproved: r.claimsApproved,
          totalRevenue: Number(r.totalRevenueGenerated),
          commissionOwed: Number(r.commissionOwed),
          commissionPaid: Number(r.commissionPaid),
          commissionPending: Number(r.commissionPending),
          closeRate: Number(r.closeRate),
        }));
      } catch (err) {
        console.error("[commissions] DB query failed:", err);
        return [];
      }
    },
    []
  );

  const totals = {
    owed: records.reduce((s, r) => s + r.commissionOwed, 0),
    paid: records.reduce((s, r) => s + r.commissionPaid, 0),
    pending: records.reduce((s, r) => s + r.commissionPending, 0),
  };

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        title="Commission Tracker"
        subtitle="Track, approve, and pay commissions for your sales team"
        icon={<BadgeDollarSign className="h-5 w-5" />}
        section="finance"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-[color:var(--text)]">{fmt(totals.pending)}</p>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">Awaiting approval</p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
              <BadgeDollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Owed</h3>
          </div>
          <p className="text-3xl font-bold text-[color:var(--text)]">{fmt(totals.owed)}</p>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">Approved, unpaid</p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Paid</h3>
          </div>
          <p className="text-3xl font-bold text-[color:var(--text)]">{fmt(totals.paid)}</p>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">Total paid out</p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Reps</h3>
          </div>
          <p className="text-3xl font-bold text-[color:var(--text)]">
            {new Set(records.map((r) => r.userId)).size}
          </p>
          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">With commission data</p>
        </div>
      </div>

      {/* Commission Table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="border-b border-[color:var(--border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[color:var(--text)]">Commission Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                <th className="px-6 py-3">Rep</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3 text-right">Revenue</th>
                <th className="px-6 py-3 text-right">Close Rate</th>
                <th className="px-6 py-3 text-right">Pending</th>
                <th className="px-6 py-3 text-right">Owed</th>
                <th className="px-6 py-3 text-right">Paid</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No commission records yet. Team performance data will appear here.
                  </td>
                </tr>
              )}
              {records.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-[var(--surface-1)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.user?.headshot_url ? (
                        <img
                          src={r.user.headshot_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                          {(r.user?.name || r.userId).substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-[color:var(--text)]">
                          {r.user?.name || r.userId.slice(0, 12)}
                        </div>
                        <div className="text-xs text-slate-500">{r.user?.email || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                    {r.periodStart} → {r.periodEnd}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[color:var(--text)]">
                    {fmt(r.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 text-right text-[color:var(--text)]">{r.closeRate}%</td>
                  <td className="px-6 py-4 text-right font-mono text-yellow-600 dark:text-yellow-400">
                    {fmt(r.commissionPending)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-orange-600 dark:text-orange-400">
                    {fmt(r.commissionOwed)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-green-600 dark:text-green-400">
                    {fmt(r.commissionPaid)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CommissionActions
                      recordId={r.id}
                      pending={r.commissionPending}
                      owed={r.commissionOwed}
                    />
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
