/**
 * Companies Search API
 * GET /api/trades/companies/search — List active companies for join-request discovery
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active companies
    const companies = await prisma.tradesCompany.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        city: true,
        state: true,
        specialties: true,
        description: true,
        isVerified: true,
      },
      orderBy: [{ isVerified: "desc" }, { name: "asc" }],
      take: 50,
    });

    // Map isVerified → verified for the frontend
    const mapped = companies.map((c) => ({
      ...c,
      verified: c.isVerified,
    }));

    return NextResponse.json({
      success: true,
      companies: mapped,
    });
  } catch (error) {
    console.error("[companies/search] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
