// MODULE 7: Community Explorer - Get nearby jobs (anonymized)
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const zip = searchParams.get("zip");

  try {
    // Find client access record for this user (via email lookup through users table)
    const clientAccess = await prisma.client_access.findFirst({
      where: { email: userId }, // Using userId as email lookup
      select: {
        claimId: true,
        claims: {
          select: { orgId: true },
        },
      },
    });

    if (!clientAccess) {
      return NextResponse.json({ jobs: [] });
    }

    const orgId = clientAccess.claims.orgId;

    // Get claims from same org, filter by zip if provided
    const claims = await prisma.claims.findMany({
      where: {
        orgId,
        status: { in: ["active", "completed"] },
        ...(zip && { properties: { zipCode: { contains: zip } } }),
      },
      select: {
        id: true,
        claimNumber: true,
        dateOfLoss: true,
        status: true,
        damageType: true,
        properties: {
          select: {
            city: true,
            state: true,
            zipCode: true,
          },
        },
      },
      take: 50,
    });

    // Anonymize data
    const jobs = claims.map((claim) => ({
      id: claim.id,
      claimNumber: claim.claimNumber?.replace(/\d{4}$/, "****") || "****",
      lossDate: claim.dateOfLoss,
      status: claim.status,
      // Only show city/zip, not full address
      city: claim.properties.city,
      state: claim.properties.state,
      zip: claim.properties.zipCode,
      lossType: claim.damageType,
    }));

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("[COMMUNITY_MAP]", error);
    return NextResponse.json({ error: "Failed to fetch community data" }, { status: 500 });
  }
}
