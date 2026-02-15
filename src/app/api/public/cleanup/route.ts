/**
 * Cleanup endpoint - removes duplicate orgs and demo claims
 * GET /api/public/cleanup?userId=xxx
 */
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const canonicalOrgId = req.nextUrl.searchParams.get("canonicalOrgId");
  const dryRun = req.nextUrl.searchParams.get("dryRun") !== "false";

  if (!userId) {
    return NextResponse.json({
      ok: false,
      error: "Missing userId query param",
      usage: "/api/public/cleanup?userId=xxx&canonicalOrgId=xxx&dryRun=false",
    });
  }

  const actions: string[] = [];

  try {
    // 1. Get all memberships for this user
    const memberships = await prisma.user_organizations.findMany({
      where: { userId },
    });

    actions.push(`Found ${memberships.length} memberships for user`);

    // Get org details for each membership
    const membershipsWithOrgs = await Promise.all(
      memberships.map(async (m) => {
        const org = await prisma.org.findUnique({
          where: { id: m.organizationId },
          select: { id: true, name: true },
        });
        return { ...m, organization: org };
      })
    );

    // 2. Find canonical org (one with most claims, or specified)
    let canonicalOrg: string | null = canonicalOrgId;

    if (!canonicalOrg) {
      const orgsWithCounts = await Promise.all(
        membershipsWithOrgs.map(async (m) => {
          const count = await prisma.claims.count({ where: { orgId: m.organizationId } });
          return { orgId: m.organizationId, count, name: m.organization?.name };
        })
      );

      // Pick org with most claims
      const sorted = orgsWithCounts.sort((a, b) => b.count - a.count);
      canonicalOrg = sorted[0]?.orgId || null;
      actions.push(`Detected canonical org: ${canonicalOrg} (${sorted[0]?.count} claims)`);
    }

    if (!canonicalOrg) {
      return NextResponse.json({ ok: false, error: "No canonical org found", actions });
    }

    // 3. List memberships to remove (all except canonical)
    const membershipsToRemove = membershipsWithOrgs.filter(
      (m) => m.organizationId !== canonicalOrg
    );
    actions.push(`Will remove ${membershipsToRemove.length} extra memberships`);

    // 4. Find duplicate demo claims in canonical org
    const demoClaims = await prisma.claims.findMany({
      where: {
        orgId: canonicalOrg,
        id: { startsWith: "demo-claim-" },
      },
      select: { id: true, claimNumber: true, title: true },
    });

    // Keep only the canonical one
    const canonicalClaimId = `demo-claim-john-smith-${canonicalOrg}`;
    const duplicateClaims = demoClaims.filter((c) => c.id !== canonicalClaimId);
    actions.push(`Found ${demoClaims.length} demo claims, ${duplicateClaims.length} duplicates`);

    if (!dryRun) {
      // Actually delete
      for (const m of membershipsToRemove) {
        await prisma.user_organizations.delete({ where: { id: m.id } });
        actions.push(`Deleted membership: ${m.id} (org: ${m.organizationId})`);
      }

      for (const c of duplicateClaims) {
        await prisma.claims.delete({ where: { id: c.id } });
        actions.push(`Deleted duplicate claim: ${c.id}`);
      }
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      userId,
      canonicalOrgId: canonicalOrg,
      membershipsToRemove: membershipsToRemove.map((m) => ({
        id: m.id,
        orgId: m.organizationId,
        orgName: m.organization?.name,
      })),
      duplicateClaims,
      actions,
      message: dryRun
        ? "Dry run - no changes made. Set dryRun=false to execute"
        : "Cleanup complete!",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message, actions }, { status: 500 });
  }
}
