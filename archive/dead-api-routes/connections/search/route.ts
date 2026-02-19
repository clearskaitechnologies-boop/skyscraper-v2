/**
 * Client Connections API
 * Search for clients and manage connections
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/connections/search - Search for clients
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ clients: [] });
    }

    // Search clients by name or email
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        orgId: true,
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    logger.error("[GET /api/connections/search] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
