export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/onboarding/init
 *
 * Production onboarding: Create blank organization on first login
 * Called automatically by ClerkProvider afterSignUpUrl="/onboarding"
 * OR can be called manually by /onboarding page
 *
 * ============================================================================
 * 🧪 QA CHECKLIST - NEW USER ONBOARDING
 * ============================================================================
 * Test 1: Fresh User Auto-Onboard
 *   1. Create new Clerk account (use incognito/different email)
 *   2. Sign up successfully
 *   3. Expected: Automatically redirected to /onboarding
 *   4. /onboarding calls POST /api/onboarding/init
 *   5. Expected: Returns { ok: true, orgId: "xxx" }
 *   6. Click "Skip for now" → Redirects to /dashboard
 *   7. Expected: Dashboard loads WITHOUT errors (no "orgId required" crashes)
 *
 * Test 2: Organization Creation Verification
 *   After signup, check database:
 *   SELECT * FROM organizations WHERE clerkOrgId='org_<userId>';
 *   Expect: 1 row with name="My Company", planId=null
 *
 *   SELECT * FROM users WHERE clerkUserId='<userId>';
 *   Expect: 1 row with orgId matching above, email from Clerk
 *
 *   SELECT * FROM user_organizations WHERE userId='<userId>';
 *   Expect: 1 row with role='owner', links user ↔ org
 *
 * Test 3: Idempotent Safety (No Duplicate Orgs)
 *   1. Same user logs out and back in
 *   2. POST /api/onboarding/init again
 *   3. Expected: Returns existing org (ok: true, description: "Organization already exists")
 *   4. Database: Still only 1 organization row for this user
 *
 * Test 4: Downstream Actions Work Immediately
 *   1. New user signs up
 *   2. Navigate to /leads/new
 *   3. Create a new lead
 *   4. Expected: Lead saves with orgId, appears in /leads list
 *   5. Navigate to /claims/new
 *   6. Expected: Can create claim (no "No org found" errors)
 *
 * 🔍 DATABASE VERIFICATION:
 *   After fresh signup, verify exactly 3 records created:
 *   1. organizations table: 1 row with clerkOrgId
 *   2. users table: 1 row with clerkUserId and orgId FK
 *   3. user_organizations table: 1 row linking user ↔ org
 *   4. BillingSettings table: 1 row with orgId FK (token tracking)
 *
 * 🐛 KNOWN ISSUES FIXED:
 *   - ✅ Changed prisma.org → prisma.Org (table name mismatch)
 *   - ✅ Added idempotent check for existing org (prevents duplicates)
 *   - ✅ Creates user_organizations junction record (fixes safeOrgContext)
 *   - ✅ Fetches real email from Clerk (no more hardcoded placeholders)
 * ============================================================================
 */

import { logger } from "@/lib/logger";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { classifyError } from "@/agents/baseAgent";
import prisma from "@/lib/prisma";
import { ensureWorkspaceForOrg } from "@/lib/workspace/ensureWorkspaceForOrg";

// Prisma singleton imported from @/lib/db/prisma

export async function POST() {
  try {
    const { userId, orgId: clerkOrgId } = await auth();

    if (!userId) {
      logger.error("[onboarding/init] ❌ Unauthorized - no userId");
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    logger.debug(`[onboarding/init] 🚀 Starting onboard for user ${userId}`);

    // Check if user already has an organization
    const existingOrg = await prisma.org.findFirst({
      where: {
        users: {
          some: {
            clerkUserId: userId,
          },
        },
      },
    });

    if (existingOrg) {
      logger.debug(`[onboarding/init] ℹ️ User ${userId} already has org ${existingOrg.id}`);

      // Ensure membership exists (idempotent safety)
      const membership = await prisma.user_organizations.findFirst({
        where: { userId: userId, organizationId: existingOrg.id },
      });
      if (!membership) {
        logger.debug(`[onboarding/init] 🔗 Creating missing membership for user ${userId}`);
        await prisma.user_organizations.create({
          data: {
            id: `uo_${existingOrg.id}_${userId}`,
            userId: userId,
            organizationId: existingOrg.id,
            role: "owner",
          },
        });
      }
      return NextResponse.json({
        ok: true,
        orgId: existingOrg.id,
        description: "Organization already exists",
      });
    }

    logger.debug(`[onboarding/init] 🆕 No existing org found - creating new one`);

    // Create new blank organization
    // Use Clerk Org ID if available, otherwise create independent Org
    const Org = await prisma.org.upsert({
      where: { clerkOrgId: clerkOrgId || `org_${userId}` },
      update: {},
      create: {
        id: randomUUID(),
        clerkOrgId: clerkOrgId || `org_${userId}`,
        name: "My Company",
        planId: null,
        updatedAt: new Date(),
      },
    });

    logger.debug(`[onboarding/init] ✅ Created org ${Org.id} with clerkOrgId ${Org.clerkOrgId}`);

    // Create user record if doesn't exist
    // Resolve real email from Clerk
    let userEmail: string | null = null;
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      userEmail = clerkUser.emailAddresses?.[0]?.emailAddress || null;
      logger.debug(`[onboarding/init] 📧 Fetched email from Clerk: ${userEmail}`);
    } catch (e) {
      logger.warn("[onboarding/init] ⚠️ Could not fetch Clerk user email", e);
    }

    await prisma.users.upsert({
      where: { clerkUserId: userId },
      create: {
        id: randomUUID(),
        clerkUserId: userId,
        email: userEmail || `unknown_${userId}@placeholder.local`,
        orgId: Org.id,
      },
      update: {
        email: userEmail || undefined,
        orgId: Org.id,
      },
    });

    logger.debug(`[onboarding/init] 👤 Created/updated user record for ${userId}`);

    // CRITICAL: Create UserOrganization membership record (used by safeOrgContext)
    await prisma.user_organizations.create({
      data: {
        id: `uo_${Org.id}_${userId}`,
        userId: userId, // Clerk user ID
        organizationId: Org.id,
        role: "owner",
      },
    });

    logger.debug(`[onboarding/init] 🔗 Created user_organizations membership`);

    // Create blank branding settings (no logo, no colors)
    await prisma.billingSettings.create({
      data: {
        id: randomUUID(),
        orgId: Org.id,
        updatedAt: new Date(),
      },
    });

    logger.debug(`[onboarding/init] 💳 Created billingSettings for org ${Org.id}`);

    // 🛡️ HARDEN: Ensure all workspace primitives exist (catches edge cases)
    await ensureWorkspaceForOrg({ orgId: Org.id, userId }).catch((err) => {
      logger.error("[onboarding/init] ensureWorkspace warning (non-fatal):", err);
    });

    logger.debug(`[onboarding/init] ✅ Onboarding complete for user ${userId}`);

    return NextResponse.json({
      ok: true,
      orgId: Org.id,
      description: "Organization created successfully",
    });
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    const classification = classifyError(errObj);
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? (error as { code: string }).code
        : undefined;
    logger.error("[onboarding/init] \u274C Onboarding init error:", {
      message: errObj.message,
      code: errorCode,
      classification,
      stack: errObj.stack?.split("\n")[0],
    });
    return NextResponse.json(
      {
        ok: false,
        error: errObj.message || "Failed to initialize organization",
        classification,
      },
      { status: classification === "transient" ? 503 : 500 }
    );
  }
}
