/**
 * Get My Connections API
 * List all clients connected to this contractor
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/connections/my - Get all connections for this contractor
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // CRITICAL FIX: Use unified org context (auto-creates if needed)
    const { orgId } = await ensureUserOrgContext(userId);

    // Get contractor profile with company
    const contractorProfile = await prisma.tradesCompanyMember.findFirst({
      where: { orgId },
      select: { id: true, companyId: true },
    });

    if (!contractorProfile?.companyId) {
      return NextResponse.json({ connections: [] });
    }

    // contractorId FK references tradesCompany.id, NOT tradesCompanyMember.id
    const connections = await prisma.clientProConnection.findMany({
      where: {
        contractorId: contractorProfile.companyId,
        status: { not: "declined" },
      },
      include: {
        // Note: Client relation might need to be added to schema
        // For now, we'll fetch client details separately
      },
      orderBy: { invitedAt: "desc" },
    });

    // Fetch client details for each connection
    const clientIds = connections.map((c) => c.clientId);
    const clients = await prisma.client.findMany({
      where: { id: { in: clientIds } },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    const clientMap = new Map(clients.map((c) => [c.id, c]));

    const enrichedConnections = connections.map((conn) => ({
      ...conn,
      client: clientMap.get(conn.clientId) || null,
    }));

    return NextResponse.json({ connections: enrichedConnections });
  } catch (error) {
    logger.error("[GET /api/connections/my] Error:", error);
    return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 });
  }
}
