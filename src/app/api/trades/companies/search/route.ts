/**
 * Company Search API for Join Company flow
 *
 * GET /api/trades/companies/search
 *
 * Returns all active companies that users can request to join.
 * This is a public-ish API (requires auth but not company membership)
 */

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase() || "";

    // Find all active companies
    const companies = await prisma.tradesCompany.findMany({
      where: {
        isActive: true,
        // If there's a search query, filter by name
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { state: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        city: true,
        state: true,
        specialties: true,
        isVerified: true,
        description: true,
        _count: {
          select: { members: { where: { isActive: true, status: "active" } } },
        },
      },
      orderBy: { name: "asc" },
      take: 50, // Limit results
    });

    return NextResponse.json({
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        city: c.city,
        state: c.state,
        specialties: c.specialties || [],
        verified: c.isVerified ?? false,
        description: c.description,
        memberCount: c._count?.members ?? 0,
      })),
    });
  } catch (error) {
    logger.error("Error searching companies:", error);
    return NextResponse.json({ error: "Failed to search companies" }, { status: 500 });
  }
}
