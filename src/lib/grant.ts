import prisma from "@/lib/prisma";
// Prisma singleton imported from @/lib/db/prisma

export async function grantTokensToOrg(opts: {
  orgId: string;
  amount: number;
  reason: string;
  meta?: any;
  userId?: string | null;
}) {
  const { orgId, amount, reason, meta, userId } = opts;

  // Ensure org-based wallet exists
  let wallet = await prisma.usage_tokens.findUnique({ where: { orgId } });
  const next = (wallet?.balance ?? 0) + amount;
  if (!wallet) {
    wallet = await prisma.usage_tokens.create({
      data: {
        id: crypto.randomUUID(),
        orgId,
        balance: next,
        updatedAt: new Date(),
      },
    });
  } else {
    // Update existing wallet
    await prisma.usage_tokens.update({
      where: { orgId },
      data: { balance: next, updatedAt: new Date() },
    });
  }

  // Record in ledger
  await prisma.tokens_ledger.create({
    data: {
      id: crypto.randomUUID(),
      org_id: orgId,
      delta: amount,
      reason,
      balance_after: next,
      metadata: {
        ...(meta ?? {}),
        userId: userId ?? null,
      },
    },
  });

  return next;
}
