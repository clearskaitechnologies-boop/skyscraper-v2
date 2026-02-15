#!/usr/bin/env tsx
// =====================================================
// CLI: FORCE TOKEN BALANCE
// =====================================================
// Usage: pnpm cli:force-tokens <orgId> <amount>
// Manually sets token balance (for testing/support)
// =====================================================

import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orgId = process.argv[2];
  const amountStr = process.argv[3];

  if (!orgId || !amountStr) {
    console.error("❌ Usage: pnpm cli:force-tokens <orgId> <amount>");
    console.error("   Example: pnpm cli:force-tokens org_abc123 1000");
    process.exit(1);
  }

  const amount = parseInt(amountStr, 10);
  if (!Number.isFinite(amount) || amount < 0) {
    console.error("❌ Amount must be a positive number");
    process.exit(1);
  }

  console.log(`🔍 Setting tokens for org: ${orgId}`);
  console.log(`💰 New AI tokens: ${amount}`);

  // Update or create token wallet
  const wallet = await prisma.tokenWallet.upsert({
    where: { orgId },
    create: {
      orgId,
      aiRemaining: amount,
    },
    update: {
      aiRemaining: amount,
    },
  });

  console.log("✅ Token balance updated!");
  console.log(`   Org ID: ${wallet.orgId}`);
  console.log(`   AI Tokens: ${wallet.aiRemaining}`);
}

main()
  .catch((error) => {
    console.error("❌ Force tokens failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
