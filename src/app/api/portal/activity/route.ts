/**
 * 📢 CLIENT ACTIVITY FEED API
 *
 * GET /api/portal/activity
 * Returns activity items for the client's feed:
 * - Messages from contractors
 * - Work request status updates
 * - Claim updates
 * - Project milestones
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

interface ActivityItem {
  id: string;
  type: "message" | "update" | "document" | "status" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  projectName?: string;
  isRead?: boolean;
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities: ActivityItem[] = [];
    const email = user.emailAddresses?.[0]?.emailAddress;

    // Find client
    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (client) {
      // Get work request updates
      const workRequests = await prisma.clientWorkRequest.findMany({
        where: { clientId: client.id },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          tradesCompany: {
            select: { name: true },
          },
        },
      });

      for (const wr of workRequests) {
        if (wr.status !== "pending") {
          activities.push({
            id: `wr-${wr.id}`,
            type: "status",
            title: `Work Request Update`,
            description: `Your ${wr.category} request is now ${wr.status}${wr.tradesCompany ? ` with ${wr.tradesCompany.name}` : ""}`,
            timestamp: wr.updatedAt.toISOString(),
            projectName: wr.title,
            isRead: false,
          });
        }
      }
    }

    // Get claim updates if client has any linked claims
    if (email) {
      const claims = await prisma.claims.findMany({
        where: {
          OR: [{ homeownerEmail: email }, { clientId: client?.id }],
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          claimNumber: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      });

      for (const claim of claims) {
        activities.push({
          id: `claim-${claim.id}`,
          type: "update",
          title: `Claim ${claim.claimNumber} Updated`,
          description: `Status: ${claim.status}`,
          timestamp: claim.updatedAt.toISOString(),
          projectName: claim.title,
          isRead: false,
        });
      }
    }

    // Get direct messages
    if (client) {
      try {
        const messages = await prisma.claimMessage.findMany({
          where: {
            userId: user.id,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            users: { select: { name: true } },
          },
        });

        for (const msg of messages) {
          // Show messages from others (userId is the author)
          if (msg.userId !== user.id) {
            activities.push({
              id: `msg-${msg.id}`,
              type: "message",
              title: `Message from ${msg.users?.name || "Contractor"}`,
              description: msg.body.length > 100 ? msg.body.slice(0, 100) + "..." : msg.body,
              timestamp: msg.createdAt.toISOString(),
              isRead: false,
            });
          }
        }
      } catch (e) {
        // ClaimMessage table might not exist or have different schema
        console.log("[Activity] ClaimMessage query skipped:", e);
      }
    }

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ activities: activities.slice(0, 20) });
  } catch (error) {
    console.error("[Activity] Error:", error);
    return NextResponse.json({ activities: [] });
  }
}
