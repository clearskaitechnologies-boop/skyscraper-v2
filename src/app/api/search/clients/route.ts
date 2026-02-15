import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * POST /api/search/clients
 * Search for clients by email, name, or address
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

    // Search for clients in ClaimClientLink table
    const links = await prisma.claimClientLink.findMany({
      where: {
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
    console.error("[CLIENT_SEARCH_ERROR]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
