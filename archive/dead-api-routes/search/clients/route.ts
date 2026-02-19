import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

/**
 * POST /api/search/clients
 * Search for clients by email, name, or address — scoped to user's org
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isAuthError(auth)) return auth;
    const { orgId } = auth;

    const body = await req.json();
    const { query } = body;

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    // Search for clients in ClaimClientLink — only via claims belonging to user's org
    const links = await prisma.claimClientLink.findMany({
      where: {
        claims: { orgId },
        OR: [
          { clientEmail: { contains: query, mode: "insensitive" } },
          { clientName: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        claims: {
          select: {
            claimNumber: true,
            properties: {
              select: {
                street: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
      take: 10,
    });

    const results = links.map((link) => ({
      id: link.id,
      clientEmail: link.clientEmail,
      clientName: link.clientName,
      status: link.status,
      claimNumber: link.claims.claimNumber,
      address: link.claims.properties?.street,
      city: link.claims.properties?.city,
      state: link.claims.properties?.state,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    logger.error("[CLIENT_SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
