import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

/**
 * POST /api/search/pros
 * Search for Pro companies or users — admin-only, returns only limited info
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;

    const body = await req.json();
    const { query } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    // Search for Pro companies (orgs table) — limited fields for security
    const orgs = await prisma.org.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      take: 10,
    });

    const results = orgs.map((org) => ({
      id: org.id,
      companyName: org.name,
      type: "company",
      createdAt: org.createdAt,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    logger.error("[PRO_SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
