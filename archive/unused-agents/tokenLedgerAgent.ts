import { randomUUID } from "crypto";
import { z } from "zod";

import prisma from "@/lib/prisma";

import { BaseAgent } from "./baseAgent";

export const TokenLedgerInput = z.object({
  orgId: z.string().min(1),
  agentName: z.string(),
  tokensUsed: z.number().min(0),
  direction: z.enum(["consume", "grant"]).default("consume"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const TokenLedgerOutput = z.object({
  recorded: z.boolean(),
  orgId: z.string(),
  agentName: z.string(),
  tokensUsed: z.number(),
  direction: z.enum(["consume", "grant"]),
  balanceRemaining: z.number().optional(),
  totalUsedTokens: z.number().optional(),
  remainingTokens: z.number().optional(),
});

export class TokenLedgerAgent extends BaseAgent<
  z.infer<typeof TokenLedgerInput>,
  z.infer<typeof TokenLedgerOutput>
> {
  inputSchema = TokenLedgerInput;
  outputSchema = TokenLedgerOutput;
  constructor() {
    super({ name: "token-ledger", version: "1.1.0" });
  }
  protected async run(input) {
    let balanceAfter: number | undefined;
    // Ensure organization exists before writing any usage or ledger entries
    const orgExists = await prisma.org.findUnique({ where: { id: input.orgId } }).catch(() => null);
    if (!orgExists) {
      console.warn("[TokenLedgerAgent] Skipping ledger write – Org missing:", input.orgId);
      return {
        recorded: false,
        orgId: input.orgId,
        agentName: input.agentName,
        tokensUsed: input.tokensUsed,
        direction: input.direction,
      };
    }
    try {
      // Compute delta (negative for consumption)
      const delta = input.direction === "consume" ? -input.tokensUsed : input.tokensUsed;

      // Update or create usage_tokens wallet (schema only supports orgId + balance)
      await prisma.usage_tokens.upsert({
        where: { orgId: input.orgId },
        update: { balance: { increment: delta } },
        create: {
          id: randomUUID(),
          orgId: input.orgId,
          balance: delta,
          tier: "beta",
          updatedAt: new Date(),
        },
      });

      const wallet = await prisma.usage_tokens.findUnique({ where: { orgId: input.orgId } });
      balanceAfter = wallet?.balance;

      // Write to tokens_ledger with correct field names
      await prisma.tokens_ledger.create({
        data: {
          id: randomUUID(),
          org_id: input.orgId,
          delta,
          reason: `agent_${input.agentName}_${input.direction}`,
          balance_after: balanceAfter ?? 0,
          metadata: input.metadata || {},
        },
      });

      // Derive total used tokens (sum of negative deltas converted to positive)
      const aggregate = await prisma.tokens_ledger.aggregate({
        where: { org_id: input.orgId },
        _sum: { delta: true },
      });
      // Sum of deltas may include grants; compute used separately
      const ledgerEntries = await prisma.tokens_ledger.findMany({
        where: { org_id: input.orgId },
        select: { delta: true },
      });
      const totalUsed = ledgerEntries
        .filter((l) => l.delta < 0)
        .reduce((a, c) => a + Math.abs(c.delta), 0);
      return {
        recorded: true,
        orgId: input.orgId,
        agentName: input.agentName,
        tokensUsed: input.tokensUsed,
        direction: input.direction,
        balanceRemaining: balanceAfter,
        totalUsedTokens: totalUsed,
        remainingTokens: balanceAfter,
      };
    } catch (e) {
      console.warn("TokenLedgerAgent DB write failed", e instanceof Error ? e.message : e);
      return {
        recorded: false,
        orgId: input.orgId,
        agentName: input.agentName,
        tokensUsed: input.tokensUsed,
        direction: input.direction,
        balanceRemaining: balanceAfter,
      };
    }
  }
}
