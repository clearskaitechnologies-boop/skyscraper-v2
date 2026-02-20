import prisma from "@/lib/prisma";

export interface LedgerEntryDTO {
  id: string;
  orgId: string;
  delta: number;
  reason: string;
  refId?: string | null;
  balanceAfter?: number | null;
  createdAt: string;
}

function mapLedger(entry: any): LedgerEntryDTO {
  return {
    id: entry.id,
    orgId: entry.orgId,
    delta: entry.delta,
    reason: entry.reason,
    refId: entry.refId || null,
    balanceAfter: entry.balanceAfter || null,
    createdAt: entry.createdAt?.toISOString() || new Date().toISOString(),
  };
}

export async function getBalance(orgId: string): Promise<number> {
  const agg = await prisma.tokens_ledger.aggregate({
    where: { orgId },
    _sum: { delta: true },
  });
  return agg._sum?.delta || 0;
}

export async function listLedger(orgId: string, limit = 50, offset = 0): Promise<{ entries: LedgerEntryDTO[]; total: number; limit: number; offset: number; balance: number }> {
  const [entries, total, balance] = await Promise.all([
    prisma.tokens_ledger.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.tokens_ledger.count({ where: { orgId } }),
    getBalance(orgId),
  ]);
  return { entries: entries.map(mapLedger), total, limit, offset, balance };
}
