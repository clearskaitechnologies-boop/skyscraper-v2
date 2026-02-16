import { Banknote, Building2, CheckCircle2, Clock } from "lucide-react";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import {
  ContentCard,
  DataTable,
  DataTableBody,
  DataTableHead,
  EmptyRow,
  Td,
  Th,
} from "@/components/ui/ContentCard";
import { StatCard } from "@/components/ui/MetricCard";
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
        <StatCard
          label="Total Checks"
          value={checks.length}
          icon={<Banknote className="h-5 w-5" />}
          intent="info"
          description={`${fmt(totalAmount)} total`}
        />
        <StatCard
          label="Pending"
          value={pending.length}
          icon={<Clock className="h-5 w-5" />}
          intent="warning"
          description={fmt(totalPending)}
        />
        <StatCard
          label="In Process"
          value={
            checks.filter((c) => ["received", "endorsed", "deposited"].includes(c.status)).length
          }
          icon={<Building2 className="h-5 w-5" />}
          intent="default"
        />
        <StatCard
          variant="gradient"
          gradientColor="success"
          label="Cleared"
          value={cleared.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          description={fmt(totalCleared)}
        />
      </div>

      {/* Add form */}
      <MortgageCheckForm />

      {/* Checks table */}
      <ContentCard header="Mortgage Checks" noPadding>
        <DataTable>
          <DataTableHead>
            <Th>Claim</Th>
            <Th>Lender</Th>
            <Th>Check #</Th>
            <Th align="right">Amount</Th>
            <Th align="center">Status</Th>
            <Th align="center">Progress</Th>
            <Th>Expected</Th>
          </DataTableHead>
          <DataTableBody>
            {checks.length === 0 && (
              <EmptyRow colSpan={7} message="No mortgage checks tracked yet." />
            )}
            {checks.map((c) => {
              const stepIdx = statusSteps.indexOf(c.status);
              return (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                >
                  <Td>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {c.claimNumber}
                    </div>
                    <div className="text-xs text-slate-500">{c.insuredName || c.claimTitle}</div>
                  </Td>
                  <Td>{c.lender}</Td>
                  <Td mono>{c.checkNumber || "—"}</Td>
                  <Td align="right" mono>
                    {fmt(c.amount)}
                  </Td>
                  <Td align="center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColors[c.status] || ""}`}
                    >
                      {c.status}
                    </span>
                  </Td>
                  <Td align="center">
                    <div className="flex items-center justify-center gap-1">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex items-center gap-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              i <= stepIdx
                                ? "bg-teal-500 dark:bg-teal-400"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                            title={step}
                          />
                          {i < statusSteps.length - 1 && (
                            <div
                              className={`h-0.5 w-3 ${i < stepIdx ? "bg-teal-500 dark:bg-teal-400" : "bg-slate-300 dark:bg-slate-600"}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </Td>
                  <Td>{c.expectedDate || "—"}</Td>
                </tr>
              );
            })}
          </DataTableBody>
        </DataTable>
      </ContentCard>
    </PageContainer>
  );
}
