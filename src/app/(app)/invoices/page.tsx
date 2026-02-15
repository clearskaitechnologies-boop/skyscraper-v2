import { DollarSign, FileText, Plus, Send } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { guarded } from "@/lib/buildPhase";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoices | SkaiScraper",
  description: "Create, send, and track invoices for your jobs and claims.",
};

export default async function InvoicesPage() {
  const ctx = await safeOrgContext();
  if (ctx.status === "unauthenticated") redirect("/sign-in");
  if (ctx.status !== "ok" || !ctx.orgId) redirect("/dashboard");

  const invoices = await guarded(
    "invoices",
    async () => {
      try {
        // Get all jobs for this org
        const orgJobs = await prisma.crm_jobs.findMany({
          where: { org_id: ctx.orgId! },
          select: { id: true, status: true, insured_name: true, property_address: true },
        });
        const jobMap = new Map(orgJobs.map((j) => [j.id, j]));
        const jobIds = orgJobs.map((j) => j.id);

        if (jobIds.length === 0) return [];

        const data = await prisma.contractor_invoices.findMany({
          where: { job_id: { in: jobIds } },
          orderBy: { created_at: "desc" },
          take: 100,
        });

        return data.map((inv) => {
          const totals = inv.totals as any;
          const job = jobMap.get(inv.job_id);
          return {
            id: inv.id,
            invoiceNo: inv.invoice_no,
            jobId: inv.job_id,
            jobName: job?.insured_name || job?.property_address || inv.job_id.slice(0, 8),
            kind: inv.kind,
            total: totals?.total ?? 0,
            paidAmount: totals?.paidAmount ?? 0,
            balanceDue: totals?.balanceDue ?? totals?.total ?? 0,
            status: totals?.status ?? "draft",
            createdAt: inv.created_at.toISOString().split("T")[0],
          };
        });
      } catch (err) {
        console.error("[invoices] DB query failed:", err);
        return [];
      }
    },
    []
  );

  const statusColors: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-600 dark:text-slate-300",
    sent: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    paid: "bg-green-500/20 text-green-600 dark:text-green-400",
    partial: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    voided: "bg-red-500/20 text-red-600 dark:text-red-400",
    overdue: "bg-red-500/20 text-red-600 dark:text-red-400",
  };

  const fmt = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((s, i) => s + i.balanceDue, 0);

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        title="Invoice Manager"
        subtitle="Create, send, and track invoices for your jobs"
        icon={<FileText className="h-5 w-5" />}
        section="finance"
      >
        <Button asChild>
          <Link href="/invoices/create">
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Link>
        </Button>
      </PageHero>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Billed</h3>
          </div>
          <p className="text-3xl font-bold text-[color:var(--text)]">{fmt(totalBilled)}</p>
          <p className="mt-1 text-xs text-slate-500">{invoices.length} invoices</p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Collected</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {fmt(totalCollected)}
          </p>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
              <Send className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Outstanding</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {fmt(totalOutstanding)}
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border)] text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Job</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Balance Due</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border)]">
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No invoices yet. Create your first invoice to get started.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-[var(--surface-1)]">
                  <td className="px-6 py-4 font-mono font-medium text-[color:var(--primary)]">
                    {inv.invoiceNo}
                  </td>
                  <td className="px-6 py-4 text-[color:var(--text)]">{inv.jobName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs capitalize text-[color:var(--text)]">
                      {inv.kind}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[color:var(--text)]">
                    {fmt(inv.total)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-[color:var(--text)]">
                    {fmt(inv.balanceDue)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[inv.status] || statusColors.draft}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{inv.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
