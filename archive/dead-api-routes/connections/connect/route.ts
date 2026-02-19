/**
 * Client Connection Management API
 * Connect/disconnect contractors with clients
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { notifyConnectionRequest } from "@/lib/services/tradesNotifications";

// POST /api/connections/connect - Create connection
export const POST = withAuth(async (req: NextRequest, { userId, orgId }) => {
  try {
    const rl = await checkRateLimit(userId, "API");
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", message: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    // Get contractor profile and their company
    const contractorProfile = await prisma.tradesCompanyMember.findFirst({
      where: { orgId },
      select: { id: true, companyId: true },
    });

    if (!contractorProfile) {
      return NextResponse.json({ error: "Contractor profile not found" }, { status: 404 });
    }

    // contractorId FK references tradesCompany.id, NOT tradesCompanyMember.id
    const companyId = contractorProfile.companyId;
    if (!companyId) {
      return NextResponse.json({ error: "Contractor has no company profile" }, { status: 400 });
    }

    // Check if already connected
    const existing = await prisma.clientProConnection.findFirst({
      where: {
        clientId,
        contractorId: companyId,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        connection: existing,
        message: "Already connected",
      });
    }

    // Create connection — contractorId must be tradesCompany.id (UUID)
    const connection = await prisma.clientProConnection.create({
      data: {
        id: crypto.randomUUID(),
        clientId,
        contractorId: companyId,
        status: "pending",
        notes: "Connected via search",
      },
    });

    // Send notification to pro
    try {
      const members = await prisma.tradesCompanyMember.findMany({
        where: { companyId },
        select: { userId: true },
      });
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { name: true, firstName: true, lastName: true },
      });
      const clientName =
        [client?.firstName, client?.lastName].filter(Boolean).join(" ") ||
        client?.name ||
        "A client";
      for (const m of members) {
        if (m.userId) {
          await notifyConnectionRequest({
            proClerkId: m.userId,
            clientName,
            connectionId: connection.id,
          });
        }
      }
    } catch (notifErr) {
      logger.error("[connections/connect] Notification error:", notifErr);
    }

    return NextResponse.json({ success: true, connection });
  } catch (error) {
    logger.error("[POST /api/connections/connect] Error:", error);
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 });
  }
});
