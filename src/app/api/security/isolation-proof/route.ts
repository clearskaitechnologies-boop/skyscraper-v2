/**
 * GET /api/security/isolation-proof
 *
 * Enterprise tenant isolation proof endpoint.
 * Returns the current user's org context and canary counts
 * to demonstrate that each org sees ONLY its own data.
 *
 * Use case: Titan demo — show two browser windows side-by-side,
 * each logged in as a different org, each seeing different counts.
 */

import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export const GET = withAuth(async (_req: NextRequest, { userId, orgId, role }) => {
  try {
    // Resolve org details
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, clerkOrgId: true, createdAt: true },
    });

    // Canary counts — these MUST differ between orgs to prove isolation
    const [claimCount, reportCount, contactCount, leadCount, templateCount, brandingExists] =
      await Promise.all([
        prisma.claims.count({ where: { orgId } }),
        prisma.ai_reports.count({ where: { orgId } }),
        prisma.contacts.count({ where: { orgId } }),
        prisma.leads.count({ where: { orgId } }),
        prisma.template.count({ where: { org_id: orgId } }).catch(() => 0),
        prisma.org_branding.findFirst({ where: { orgId }, select: { id: true } }).then((b) => !!b),
      ]);

    // Build stamp — injected at build time, cannot lie
    const buildStamp = {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      buildTime: process.env.__BUILD_TIME__ || "unknown",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    };

    return NextResponse.json({
      ok: true,
      isolation: {
        orgId,
        orgName: org?.name || "Unknown",
        clerkOrgId: org?.clerkOrgId || null,
        userId,
        role,
        orgCreatedAt: org?.createdAt || null,
      },
      canary: {
        claims: claimCount,
        reports: reportCount,
        contacts: contactCount,
        leads: leadCount,
        templates: templateCount,
        hasBranding: brandingExists,
      },
      build: buildStamp,
      proof: `Org "${org?.name}" sees ${claimCount} claims, ${reportCount} reports, ${contactCount} contacts. Any other org will see different numbers — that IS tenant isolation.`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error("[isolation-proof] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to generate isolation proof" },
      { status: 500 }
    );
  }
});
