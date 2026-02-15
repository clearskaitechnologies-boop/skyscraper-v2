export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

const DEMO_CLAIM_NUMBER = "DEMO-2024-001";

/**
 * GET /api/system/demo-ids
 *
 * Returns demo claim and template IDs for quick demos and testing.
 * Prioritizes demo claim if it exists, otherwise returns first available claim.
 * Used by smoke-demo-lock.sh and demo scripts.
 */
export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    const orgId = authResult?.orgId;

    if (!userId || !orgId) {
      return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    }

    // Try to find demo claim first, fallback to any claim
    let demoClaim = await prisma.claims.findFirst({
      where: {
        orgId,
        claimNumber: DEMO_CLAIM_NUMBER,
      },
      select: { id: true, claimNumber: true },
    });

    if (!demoClaim) {
      // No demo claim, find most recent claim
      demoClaim = await prisma.claims.findFirst({
        where: { orgId },
        select: { id: true, claimNumber: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!demoClaim) {
      return NextResponse.json(
        {
          error: "NO_CLAIMS",
          message:
            "No claims found. Run: DEMO_ORG_ID=<your-org-id> node scripts/seed-demo-claim-pack.js",
        },
        { status: 404 }
      );
    }

    // Find first OrgTemplate for this org
    const firstOrgTemplate = await prisma.orgTemplate.findFirst({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });

    // Fallback to marketplace template if no org templates
    let templateId: string | null = null;
    let templateTitle: string | null = null;

    if (firstOrgTemplate) {
      templateId = firstOrgTemplate.templateId;
      // Get template name separately since there's no relation
      const template = await prisma.template.findUnique({
        where: { id: firstOrgTemplate.templateId },
        select: { name: true },
      });
      templateTitle = template?.name || null;
    } else {
      const firstTemplate = await prisma.template.findFirst({
        where: { isPublished: true },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      });

      if (firstTemplate) {
        templateId = firstTemplate.id;
        templateTitle = firstTemplate.name;
      }
    }

    if (!templateId) {
      return NextResponse.json(
        {
          error: "NO_TEMPLATES",
          message: "No templates found. Add a template to your organization first.",
        },
        { status: 404 }
      );
    }

    const isDemo = demoClaim.claimNumber === DEMO_CLAIM_NUMBER;

    // Get org info
    const org = await prisma.org.findFirst({
      where: { clerkOrgId: orgId },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      ok: true,
      demoClaimId: demoClaim.id,
      claimNumber: demoClaim.claimNumber,
      demoOrgTemplateId: firstOrgTemplate?.id || null,
      templateId,
      templateTitle,
      isDemo,
      org: org
        ? {
            id: org.id,
            name: org.name,
          }
        : null,
    });
  } catch (error) {
    console.error("[DEMO_IDS] Error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
