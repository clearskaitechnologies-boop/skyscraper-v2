import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { ensureDemoDataForOrg } from "@/lib/demoSeed";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/workspace/init
 * Idempotent workspace initialization
 * Creates org + seeds demo data if needed
 */
export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    logger.debug("[WORKSPACE_INIT] Starting for user:", userId);

    // 1. Check if user already has an org
    const existingMembership = await prisma.user_organizations.findFirst({
      where: { userId },
      include: { Org: true },
    });

    if (existingMembership?.organizationId) {
      console.info("[workspace/init]", {
        userId,
        created: false,
        orgId: existingMembership.organizationId,
        status: "existing",
      });

      // Skip demo seeding for existing orgs - data already exists
      // This prevents duplicate leads on every workspace load

      return NextResponse.json({
        orgId: existingMembership.organizationId,
        orgName: existingMembership.Org.name,
        created: false,
        message: "Workspace already initialized",
      });
    }

    // 2. Create new org
    const orgName = user.firstName
      ? `${user.firstName}'s Company`
      : user.emailAddresses[0]?.emailAddress?.split("@")[0] + "'s Company" || "My Company";
    const fallbackClerkOrgId = `workspace_${userId}_${Date.now()}`;

    logger.debug("[WORKSPACE_INIT] Creating new org:", orgName);

    const newOrg = await prisma.org.create({
      data: {
        id: crypto.randomUUID(),
        name: orgName,
        clerkOrgId: fallbackClerkOrgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log("[workspace/init] Created org:", {
      orgId: newOrg.id,
      name: newOrg.name,
      userId,
    });

    // 3. Create membership
    await prisma.user_organizations.create({
      data: {
        userId,
        organizationId: newOrg.id,
        role: "ADMIN",
        createdAt: new Date(),
      },
    });

    console.log("[workspace/init] Created membership:", {
      userId,
      orgId: newOrg.id,
      role: "ADMIN",
    });

    // 4. Seed demo data (John Smith claim) - soft-fail, never block org creation
    try {
      const seedResult = await ensureDemoDataForOrg({
        orgId: newOrg.id,
        userId,
      });
      logger.debug("[workspace/init] Demo data seeded:", seedResult);
    } catch (seedError) {
      console.error("[workspace/init] Demo seed failed (non-fatal):", seedError);
      // Continue anyway - org is created, demo data is optional
    }

    // 5. Update Clerk metadata (non-blocking)
    try {
      await (user as any).update({
        publicMetadata: {
          orgId: newOrg.id,
          role: "ADMIN",
        },
      });
      logger.debug("[workspace/init] Updated Clerk metadata");
    } catch (metadataError) {
      console.error("[workspace/init] Clerk metadata update failed (non-fatal):", metadataError);
      // Non-fatal - org is created, Clerk metadata is optional
    }

    console.info("[workspace/init]", {
      userId,
      created: true,
      orgId: newOrg.id,
      status: "success",
    });

    return NextResponse.json({
      orgId: newOrg.id,
      orgName: newOrg.name,
      created: true,
      message: "Workspace initialized successfully",
    });
  } catch (error: any) {
    logger.error("[WORKSPACE_INIT] Fatal error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize workspace",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
