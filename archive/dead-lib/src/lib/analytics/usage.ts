import prisma from "@/lib/prisma";

export async function getOrgUsageSnapshot(orgId: string) {
  const [reports, aiReports, tokens] = await Promise.all([
    prisma.ai_reports.count({ where: { orgId } }),
    prisma.ai_reports.count({ where: { orgId } }),
    prisma.tokens_ledger.aggregate({ where: { orgId }, _sum: { tokensUsed: true } } as any)
  ]);
  return {
    reports,
    aiReports,
    tokensUsed: (tokens as any)?._sum?.tokensUsed || 0
  };
}
