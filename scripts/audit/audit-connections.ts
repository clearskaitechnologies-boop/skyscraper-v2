#!/usr/bin/env npx ts-node
/**
 * 🔬 CONNECTION INTEGRITY AUDIT — Automated Script
 *
 * Runs programmatic verification of all relationship integrity.
 * Execute: npx ts-node scripts/audit/audit-connections.ts
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = Critical violations found
 *   2 = Warnings found (non-critical)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuditResult {
  check: string;
  passed: boolean;
  level: "critical" | "warning" | "info";
  count: number;
  details?: string[];
}

const results: AuditResult[] = [];
let criticalFailures = 0;
let warnings = 0;

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function addResult(result: AuditResult) {
  results.push(result);
  if (!result.passed) {
    if (result.level === "critical") criticalFailures++;
    else if (result.level === "warning") warnings++;
  }
}

// ============================================================================
// SECTION 1: COMPANY INTEGRITY
// ============================================================================

async function auditCompanyIntegrity() {
  log("━", "━".repeat(60));
  log("📊", "SECTION 1: COMPANY INTEGRITY");
  log("━", "━".repeat(60));

  // 1.1 Orphan companies (no members)
  const orphanCompanies = await prisma.$queryRaw<{ id: string; name: string }[]>`
    SELECT c.id, c.name
    FROM "tradesCompany" c
    LEFT JOIN "tradesCompanyMember" m ON m."companyId" = c.id
    WHERE m.id IS NULL
  `;

  addResult({
    check: "Orphan companies (no members)",
    passed: orphanCompanies.length === 0,
    level: "warning",
    count: orphanCompanies.length,
    details: orphanCompanies.slice(0, 5).map((c) => `${c.id}: ${c.name}`),
  });
  log(orphanCompanies.length === 0 ? "✅" : "⚠️", `Orphan companies: ${orphanCompanies.length}`);

  // 1.2 Members with invalid companyId
  const orphanMembers = await prisma.$queryRaw<{ id: string; userId: string }[]>`
    SELECT m.id, m."userId"
    FROM "tradesCompanyMember" m
    LEFT JOIN "tradesCompany" c ON c.id = m."companyId"
    WHERE m."companyId" IS NOT NULL AND c.id IS NULL
  `;

  addResult({
    check: "Members with invalid companyId",
    passed: orphanMembers.length === 0,
    level: "critical",
    count: orphanMembers.length,
    details: orphanMembers.slice(0, 5).map((m) => m.id),
  });
  log(
    orphanMembers.length === 0 ? "✅" : "🚨",
    `Members with invalid company: ${orphanMembers.length}`
  );

  // 1.3 Duplicate memberships
  const duplicates = await prisma.$queryRaw<{ userId: string; companyId: string; count: number }[]>`
    SELECT "userId", "companyId", COUNT(*)::int as count
    FROM "tradesCompanyMember"
    WHERE "companyId" IS NOT NULL
    GROUP BY "userId", "companyId"
    HAVING COUNT(*) > 1
  `;

  addResult({
    check: "Duplicate memberships",
    passed: duplicates.length === 0,
    level: "critical",
    count: duplicates.length,
    details: duplicates.slice(0, 5).map((d) => `user ${d.userId} in company ${d.companyId}`),
  });
  log(duplicates.length === 0 ? "✅" : "🚨", `Duplicate memberships: ${duplicates.length}`);
}

// ============================================================================
// SECTION 2: PROFILE VISIBILITY
// ============================================================================

async function auditProfileVisibility() {
  log("━", "━".repeat(60));
  log("👁️", "SECTION 2: PROFILE VISIBILITY");
  log("━", "━".repeat(60));

  // Profiles hidden from Find-a-Pro
  const hidden = await prisma.tradesCompanyMember.count({
    where: {
      OR: [
        { onboardingStep: { not: "complete" } },
        { status: { not: "active" } },
        { isActive: { not: true } },
      ],
    },
  });

  const visible = await prisma.tradesCompanyMember.count({
    where: {
      onboardingStep: "complete",
      status: "active",
      isActive: true,
    },
  });

  addResult({
    check: "Hidden profiles (incomplete/inactive)",
    passed: true, // Info only
    level: "info",
    count: hidden,
  });

  log("📊", `Visible profiles: ${visible}`);
  log("📊", `Hidden profiles: ${hidden}`);
}

// ============================================================================
// SECTION 3: TRADES CONNECTION INTEGRITY
// ============================================================================

async function auditTradesConnections() {
  log("━", "━".repeat(60));
  log("🔗", "SECTION 3: TRADES CONNECTION INTEGRITY");
  log("━", "━".repeat(60));

  // 3.1 Null participants
  const nullConnections = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "tradesConnection"
    WHERE "requesterId" IS NULL OR "addresseeId" IS NULL
  `;

  addResult({
    check: "Connections with null participants",
    passed: nullConnections.length === 0,
    level: "critical",
    count: nullConnections.length,
  });
  log(
    nullConnections.length === 0 ? "✅" : "🚨",
    `Null participant connections: ${nullConnections.length}`
  );

  // 3.2 Self-connections
  const selfConnections = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "tradesConnection"
    WHERE "requesterId" = "addresseeId"
  `;

  addResult({
    check: "Self-connections",
    passed: selfConnections.length === 0,
    level: "critical",
    count: selfConnections.length,
  });
  log(selfConnections.length === 0 ? "✅" : "🚨", `Self-connections: ${selfConnections.length}`);

  // 3.3 Duplicate accepted connections
  const duplicateConnections = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int as count FROM (
      SELECT LEAST("requesterId","addresseeId") as a,
             GREATEST("requesterId","addresseeId") as b
      FROM "tradesConnection"
      WHERE status = 'accepted'
      GROUP BY a, b
      HAVING COUNT(*) > 1
    ) dupes
  `;

  addResult({
    check: "Duplicate accepted connections",
    passed: duplicateConnections[0]?.count === 0,
    level: "critical",
    count: duplicateConnections[0]?.count || 0,
  });
  log(
    duplicateConnections[0]?.count === 0 ? "✅" : "🚨",
    `Duplicate connections: ${duplicateConnections[0]?.count || 0}`
  );
}

// ============================================================================
// SECTION 4: CLIENT-PRO CONNECTION INTEGRITY
// ============================================================================

async function auditClientProConnections() {
  log("━", "━".repeat(60));
  log("🤝", "SECTION 4: CLIENT-PRO CONNECTION INTEGRITY");
  log("━", "━".repeat(60));

  // 4.1 Invalid client references
  const invalidClients = await prisma.$queryRaw<{ id: string }[]>`
    SELECT cpc.id
    FROM "ClientProConnection" cpc
    LEFT JOIN "Client" c ON c.id = cpc."clientId"
    WHERE c.id IS NULL
  `;

  addResult({
    check: "ClientProConnection with invalid client",
    passed: invalidClients.length === 0,
    level: "critical",
    count: invalidClients.length,
  });
  log(invalidClients.length === 0 ? "✅" : "🚨", `Invalid client refs: ${invalidClients.length}`);

  // 4.2 Invalid contractor references
  const invalidContractors = await prisma.$queryRaw<{ id: string }[]>`
    SELECT cpc.id
    FROM "ClientProConnection" cpc
    LEFT JOIN "tradesCompany" tc ON tc.id = cpc."contractorId"
    WHERE tc.id IS NULL
  `;

  addResult({
    check: "ClientProConnection with invalid contractor",
    passed: invalidContractors.length === 0,
    level: "critical",
    count: invalidContractors.length,
  });
  log(
    invalidContractors.length === 0 ? "✅" : "🚨",
    `Invalid contractor refs: ${invalidContractors.length}`
  );
}

// ============================================================================
// SECTION 5: CLAIM ACCESS INTEGRITY
// ============================================================================

async function auditClaimAccess() {
  log("━", "━".repeat(60));
  log("📋", "SECTION 5: CLAIM ACCESS INTEGRITY");
  log("━", "━".repeat(60));

  // 5.1 client_access with invalid claimId
  const invalidAccess = await prisma.$queryRaw<{ id: string }[]>`
    SELECT ca.id
    FROM "client_access" ca
    LEFT JOIN "claims" c ON c.id = ca."claimId"
    WHERE c.id IS NULL
  `;

  addResult({
    check: "client_access with invalid claimId",
    passed: invalidAccess.length === 0,
    level: "critical",
    count: invalidAccess.length,
  });
  log(invalidAccess.length === 0 ? "✅" : "🚨", `Invalid claim access: ${invalidAccess.length}`);

  // 5.2 Claims without orgId
  const noOrgClaims = await prisma.claims.count({
    where: {
      OR: [{ orgId: null }, { orgId: "" }],
    },
  });

  addResult({
    check: "Claims without orgId",
    passed: noOrgClaims === 0,
    level: "critical",
    count: noOrgClaims,
  });
  log(noOrgClaims === 0 ? "✅" : "🚨", `Claims without orgId: ${noOrgClaims}`);
}

// ============================================================================
// SECTION 6: MESSAGING INTEGRITY
// ============================================================================

async function auditMessaging() {
  log("━", "━".repeat(60));
  log("💬", "SECTION 6: MESSAGING INTEGRITY");
  log("━", "━".repeat(60));

  // 6.1 Threads with empty participants
  const emptyThreads = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "MessageThread"
    WHERE array_length(participants, 1) IS NULL 
       OR array_length(participants, 1) < 1
  `;

  addResult({
    check: "Threads with empty participants",
    passed: emptyThreads.length === 0,
    level: "warning",
    count: emptyThreads.length,
  });
  log(emptyThreads.length === 0 ? "✅" : "⚠️", `Empty participant threads: ${emptyThreads.length}`);

  // 6.2 Threads without orgId
  const noOrgThreads = await prisma.messageThread.count({
    where: {
      OR: [{ orgId: null }, { orgId: "" }],
    },
  });

  addResult({
    check: "Threads without orgId",
    passed: noOrgThreads === 0,
    level: "critical",
    count: noOrgThreads,
  });
  log(noOrgThreads === 0 ? "✅" : "🚨", `Threads without orgId: ${noOrgThreads}`);

  // 6.3 Messages without valid thread
  const orphanMessages = await prisma.$queryRaw<{ id: string }[]>`
    SELECT m.id
    FROM "Message" m
    LEFT JOIN "MessageThread" t ON t.id = m."threadId"
    WHERE t.id IS NULL
  `;

  addResult({
    check: "Messages without valid thread",
    passed: orphanMessages.length === 0,
    level: "critical",
    count: orphanMessages.length,
  });
  log(orphanMessages.length === 0 ? "✅" : "🚨", `Orphan messages: ${orphanMessages.length}`);
}

// ============================================================================
// SECTION 7: CROSS-TENANT ISOLATION
// ============================================================================

async function auditCrossTenant() {
  log("━", "━".repeat(60));
  log("🔒", "SECTION 7: CROSS-TENANT ISOLATION");
  log("━", "━".repeat(60));

  // Cross-org thread-claim mismatch
  const crossOrgViolations = await prisma.$queryRaw<{ thread_id: string }[]>`
    SELECT mt.id as thread_id
    FROM "MessageThread" mt
    JOIN "claims" c ON mt."claimId" = c.id
    WHERE mt."orgId" != c."orgId"
  `;

  addResult({
    check: "Cross-org thread-claim violations",
    passed: crossOrgViolations.length === 0,
    level: "critical",
    count: crossOrgViolations.length,
  });
  log(
    crossOrgViolations.length === 0 ? "✅" : "🚨",
    `Cross-tenant violations: ${crossOrgViolations.length}`
  );
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("");
  console.log("═".repeat(64));
  console.log("🔬 CONNECTION INTEGRITY AUDIT");
  console.log("═".repeat(64));
  console.log("");

  try {
    await auditCompanyIntegrity();
    await auditProfileVisibility();
    await auditTradesConnections();
    await auditClientProConnections();
    await auditClaimAccess();
    await auditMessaging();
    await auditCrossTenant();

    // Summary
    console.log("");
    console.log("═".repeat(64));
    console.log("📋 AUDIT SUMMARY");
    console.log("═".repeat(64));
    console.log("");

    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;

    console.log(`Total checks:     ${results.length}`);
    console.log(`Passed:           ${passed} ✅`);
    console.log(`Failed:           ${failed} ❌`);
    console.log(`Critical:         ${criticalFailures} 🚨`);
    console.log(`Warnings:         ${warnings} ⚠️`);
    console.log("");

    if (criticalFailures > 0) {
      console.log("🚨 CRITICAL FAILURES DETECTED:");
      results
        .filter((r) => !r.passed && r.level === "critical")
        .forEach((r) => {
          console.log(`   • ${r.check}: ${r.count} violations`);
          r.details?.forEach((d) => console.log(`     - ${d}`));
        });
      console.log("");
    }

    if (warnings > 0) {
      console.log("⚠️ WARNINGS:");
      results
        .filter((r) => !r.passed && r.level === "warning")
        .forEach((r) => console.log(`   • ${r.check}: ${r.count}`));
      console.log("");
    }

    // Exit code
    if (criticalFailures > 0) {
      console.log("❌ AUDIT FAILED — Critical violations must be fixed");
      process.exit(1);
    } else if (warnings > 0) {
      console.log("⚠️ AUDIT PASSED WITH WARNINGS");
      process.exit(2);
    } else {
      console.log("✅ AUDIT PASSED — All integrity checks green");
      process.exit(0);
    }
  } catch (error) {
    console.error("Fatal error during audit:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
