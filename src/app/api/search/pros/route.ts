import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * POST /api/search/pros
 * Search for Pro companies or users
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    // Search for Pro companies (orgs table)
    const orgs = await prisma.org.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        planKey: true,
        createdAt: true,
      },
      take: 10,
    });

    const results = orgs.map((org) => ({
      id: org.id,
      companyName: org.name,
      type: "company",
      planTier: org.planKey,
      createdAt: org.createdAt,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[PRO_SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
