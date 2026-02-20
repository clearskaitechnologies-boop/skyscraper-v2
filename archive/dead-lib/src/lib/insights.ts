import { getDelegate } from '@/lib/db/modelAliases';
import prisma from "@/lib/prisma";

export async function gatherDashboardFacts() {
  const [kpis, claimsCount, supplementsCount, payments] = await Promise.all([
    prisma.DashboardKpi.findMany({ orderBy: { createdAt: "desc" }, take: 6 }).catch(() => []),
    prisma.claims.count().catch(() => 0),
    getDelegate('supplementItem').count().catch(() => 0),
    prisma.claim_payments.groupBy({
      by: ["type"],
      _sum: { amountCents: true },
    }).catch(() => [] as any[]),
  ]);

  const paid = payments.find((p) => p.type === "ACV" || p.type === "RCV");
  const sup = payments.find((p) => p.type === "SUPPLEMENT");

  return {
    kpis: kpis.map((k) => ({ label: k.label, value: k.value ?? 0, trend: k.trend ?? 0 })),
    claimsCount,
    supplementsCount,
    paidCents: paid?._sum?.amountCents ?? 0,
    supplementsPaidCents: sup?._sum?.amountCents ?? 0,
  };
}
