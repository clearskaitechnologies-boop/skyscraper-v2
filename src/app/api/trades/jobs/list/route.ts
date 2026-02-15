export const dynamic = "force-dynamic";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/trades/jobs/list
 *
 * Unified job list for trades tools — returns ALL job sources:
 *   - Insurance claims (from claims table)
 *   - Retail jobs (leads with jobCategory = out_of_pocket)
 *   - Financed jobs (leads with jobCategory = financed)
 *   - Repair jobs (leads with jobCategory = repair)
 *   - General leads (all other leads)
 *
 * Each item has a normalized shape: { id, type, label, address, date, status }
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId: clerkOrgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // DB-first org resolution
    let orgId = clerkOrgId;
    if (!orgId) {
      const dbUser = await prisma.users.findFirst({
        where: { clerkUserId: userId },
        select: { orgId: true },
      });
      orgId = dbUser?.orgId || null;
    }
    if (!orgId) {
      const membership = await prisma.tradesCompanyMember.findUnique({
        where: { userId },
        select: { orgId: true, companyId: true },
      });
      orgId = membership?.orgId || membership?.companyId || null;
    }
    if (!orgId) {
      return NextResponse.json({ jobs: [] });
    }

    // Fetch claims + leads in parallel
    const [claims, leads] = await Promise.all([
      prisma.claims.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          claimNumber: true,
          title: true,
          damageType: true,
          dateOfLoss: true,
          status: true,
          carrier: true,
          createdAt: true,
          properties: {
            select: {
              street: true,
              city: true,
              state: true,
              zipCode: true,
            },
          },
        },
      }),
      prisma.leads.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          title: true,
          stage: true,
          jobCategory: true,
          address: true,
          createdAt: true,
        },
      }),
    ]);

    // Normalize claims
    const claimJobs = claims.map((c) => {
      const addr = c.properties
        ? [c.properties.street, c.properties.city, c.properties.state].filter(Boolean).join(", ")
        : null;
      return {
        id: c.id,
        type: "claim" as const,
        category: "Insurance Claim",
        label: `Claim #${c.claimNumber || "—"}${c.title ? ` — ${c.title}` : ""}`,
        address: addr,
        date: c.dateOfLoss?.toISOString() || c.createdAt?.toISOString() || null,
        status: c.status || "active",
        damageType: c.damageType,
        carrier: c.carrier,
      };
    });

    // Normalize leads by jobCategory
    const categoryLabels: Record<string, string> = {
      out_of_pocket: "Retail Job",
      financed: "Financed Job",
      repair: "Repair Job",
    };
    const leadJobs = leads.map((l) => ({
      id: l.id,
      type: "lead" as const,
      category: categoryLabels[l.jobCategory || ""] || "Lead",
      label: l.title || "Untitled Lead",
      address: l.address || null,
      date: l.createdAt?.toISOString() || null,
      status: l.stage || "new",
      damageType: null,
      carrier: null,
    }));

    return NextResponse.json({
      jobs: [...claimJobs, ...leadJobs],
      counts: {
        claims: claimJobs.length,
        retail: leadJobs.filter((l) => l.category === "Retail Job").length,
        financed: leadJobs.filter((l) => l.category === "Financed Job").length,
        repair: leadJobs.filter((l) => l.category === "Repair Job").length,
        leads: leadJobs.filter((l) => l.category === "Lead").length,
      },
    });
  } catch (err) {
    console.error("[trades/jobs/list] Error:", err);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
