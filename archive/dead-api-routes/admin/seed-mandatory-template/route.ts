/**
 * Seed Mandatory Template to All Organizations
 * POST /api/admin/seed-mandatory-template
 *
 * This ensures every organization has the "Initial Claim Inspection" template
 * Creates the template if it doesn't exist in the database
 */

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

const MANDATORY_TEMPLATE_SLUG = "initial-claim-inspection";
const MANDATORY_TEMPLATE_DATA = {
  slug: "initial-claim-inspection",
  name: "Initial Claim Inspection",
  description:
    "First response inspection report documenting initial damage findings and emergency mitigation. Essential for all claim documentation.",
  category: "Inspections",
  version: "1.0",
  isPublished: true,
  isActive: true,
  isFeatured: true,
  tags: ["initial", "claim", "inspection", "mandatory"],
};

export async function POST() {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.userId) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit(ctx.userId, "API");
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", message: "Too many requests" },
        { status: 429 }
      );
    }

    // Get or create the mandatory template
    let template = await prisma.template.findFirst({
      where: { slug: MANDATORY_TEMPLATE_SLUG },
    });

    // Create the template if it doesn't exist
    if (!template) {
      logger.debug("[SeedMandatoryTemplate] Creating template:", MANDATORY_TEMPLATE_SLUG);
      template = await prisma.template.create({
        data: MANDATORY_TEMPLATE_DATA,
      });
      logger.debug("[SeedMandatoryTemplate] Created template:", template.id);
    } else if (!template.isPublished) {
      // Ensure template is published
      template = await prisma.template.update({
        where: { id: template.id },
        data: { isPublished: true, isActive: true },
      });
    }

    // Get all organizations
    const organizations = await prisma.org.findMany({
      // Note: isActive field doesn't exist on Org model
      select: { id: true, name: true },
    });

    if (organizations.length === 0) {
      return NextResponse.json({ message: "No organizations found", seeded: 0 }, { status: 200 });
    }

    // Check which orgs already have this template
    const existingLinks = await prisma.orgTemplate.findMany({
      where: {
        templateId: template.id,
        orgId: { in: organizations.map((o) => o.id) },
      },
      select: { orgId: true },
    });

    const existingOrgIds = new Set(existingLinks.map((l) => l.orgId));
    const orgsNeedingTemplate = organizations.filter((o) => !existingOrgIds.has(o.id));

    // Seed template to orgs that don't have it
    let seededCount = 0;
    for (const org of orgsNeedingTemplate) {
      try {
        await prisma.orgTemplate.create({
          data: {
            orgId: org.id,
            templateId: template.id,
            isActive: true,
            customName: null,
          },
        });
        seededCount++;
        logger.debug(`[SeedTemplate] Added "${template.name}" to org: ${org.name}`);
      } catch (error) {
        // Ignore duplicate key errors
        if (error.code !== "P2002") {
          logger.error(`[SeedTemplate] Error for org ${org.name}:`, error);
        }
      }
    }

    // Also reactivate any deactivated links
    const reactivated = await prisma.orgTemplate.updateMany({
      where: {
        templateId: template.id,
        orgId: { in: organizations.map((o) => o.id) },
        isActive: false,
      },
      data: { isActive: true },
    });

    return NextResponse.json({
      message: "Mandatory template seeded successfully",
      template: { id: template.id, name: template.name, slug: template.slug },
      totalOrgs: organizations.length,
      alreadyHad: existingOrgIds.size,
      newlySeeded: seededCount,
      reactivated: reactivated.count,
    });
  } catch (error) {
    logger.error("[SeedMandatoryTemplate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed template" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check status of mandatory template
    const template = await prisma.template.findFirst({
      where: { slug: MANDATORY_TEMPLATE_SLUG },
    });

    if (!template) {
      return NextResponse.json({
        status: "missing",
        message: `Template "${MANDATORY_TEMPLATE_SLUG}" not found`,
      });
    }

    const organizations = await prisma.org.findMany({
      // Note: isActive field doesn't exist on Org model
      select: { id: true, name: true },
    });

    const orgTemplates = await prisma.orgTemplate.findMany({
      where: {
        templateId: template.id,
        isActive: true,
      },
      select: { orgId: true },
    });

    const linkedOrgIds = new Set(orgTemplates.map((ot) => ot.orgId));
    const missingOrgs = organizations.filter((o) => !linkedOrgIds.has(o.id));

    return NextResponse.json({
      status: missingOrgs.length === 0 ? "complete" : "incomplete",
      template: { id: template.id, name: template.name, slug: template.slug },
      totalOrgs: organizations.length,
      linkedOrgs: linkedOrgIds.size,
      missingOrgs: missingOrgs.map((o) => ({ id: o.id, name: o.name })),
    });
  } catch (error) {
    logger.error("[CheckMandatoryTemplate] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to check template status" },
      { status: 500 }
    );
  }
}
