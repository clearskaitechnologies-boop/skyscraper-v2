export const dynamic = "force-dynamic";
export const revalidate = 0;
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { prismaModel } from "@/lib/db/prismaModel";
import prisma from "@/lib/prisma";

/**
 * Lightweight claims list endpoint for dropdowns/wizards
 * Returns minimal claim data to avoid heavy queries
 *
 * Uses DB-first org resolution (users table + tradesCompanyMember)
 * instead of Clerk orgId which is often null for trades-only users.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId: clerkOrgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // DB-first org resolution: users table → tradesCompanyMember → Clerk orgId
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
      return NextResponse.json({ claims: [] }); // No org = no claims, but don't error
    }

    const Claims = prismaModel("claims");
    const Properties = prismaModel("properties");

    const claims = await Claims.findMany({
      where: { orgId },
      select: {
        id: true,
        orgId: true,
        propertyId: true,
        claimNumber: true,
        title: true,
        damageType: true,
        dateOfLoss: true,
        carrier: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const propertyIds = [...new Set(claims.map((c) => c.propertyId).filter(Boolean))] as string[];

    const properties = propertyIds.length
      ? await Properties.findMany({
          where: { id: { in: propertyIds }, orgId },
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
            name: true,
            roofType: true,
          },
        })
      : [];

    const propsById = new Map(properties.map((p) => [p.id, p]));

    const claimsLite = claims.map((c) => {
      const p = c.propertyId ? propsById.get(c.propertyId) : null;
      const propertyAddress = p
        ? `${(p as any).street}${(p as any).city ? `, ${(p as any).city}` : ""}${(p as any).state ? `, ${(p as any).state}` : ""}${(p as any).zipCode ? ` ${(p as any).zipCode}` : ""}`.trim()
        : null;

      return {
        id: c.id,
        claimNumber: c.claimNumber,
        insured_name: (c as any).insured_name ?? (p as any)?.name ?? "—",
        propertyAddress,
        typeOfLoss: c.damageType,
        dateOfLoss: c.dateOfLoss?.toISOString() || null,
        roofType: (p as any)?.roofType || null,
      };
    });

    return NextResponse.json({ claims: claimsLite });
  } catch (err) {
    console.error("Error fetching claims lite:", err);
    return NextResponse.json({ error: "Failed to fetch claims." }, { status: 500 });
  }
}
