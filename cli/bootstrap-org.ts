#!/usr/bin/env tsx
// =====================================================
// CLI: BOOTSTRAP ORGANIZATION
// =====================================================
// Usage: pnpm cli:bootstrap-org <clerkOrgId>
// Creates or updates org with starter tokens
// =====================================================

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const clerkOrgId = process.argv[2];

  if (!clerkOrgId) {
    console.error("❌ Usage: pnpm cli:bootstrap-org <clerkOrgId>");
    process.exit(1);
  }

  console.log(`🔍 Bootstrapping org: ${clerkOrgId}`);

  // Find or create org
  let org = await prisma.org.findUnique({
    where: { clerkOrgId },
    include: { tokens: true },
  });

  if (!org) {
    console.log("📝 Creating new org...");
    org = await prisma.org.upsert({
      where: { clerkOrgId: targetId },
      update: {},
      create: {
        id: randomUUID(),
        clerkOrgId,
        name: `Org ${clerkOrgId.slice(0, 8)}`,
        planKey: "solo",
        subscriptionStatus: "active",
      },
      include: { tokens: true },
    });
  }

  // Ensure token wallet exists
  if (!org.tokens) {
    console.log("💰 Creating token wallet...");
    await prisma.tokenWallet.create({
      data: {
        orgId: org.id,
        aiRemaining: 100, // Starter tokens
      },
    });
  } else {
    console.log(`💰 Current AI tokens: ${org.tokens.aiRemaining} tokens`);
  }

  console.log("✅ Bootstrap complete!");
  console.log(`   Org ID: ${org.id}`);
  console.log(`   Clerk Org ID: ${org.clerkOrgId}`);
  console.log(`   Plan: ${org.planKey}`);
  console.log(`   Status: ${org.subscriptionStatus}`);
}

main()
  .catch((error) => {
    console.error("❌ Bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
