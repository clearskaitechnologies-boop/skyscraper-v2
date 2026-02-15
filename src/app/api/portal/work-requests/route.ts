import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find client by userId
    const client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      return NextResponse.json({ requests: [] });
    }

    // Fetch work requests for this client
    const requests = await prisma.clientWorkRequest.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      include: {
        tradesCompany: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Transform for frontend
    const transformed = requests.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      tradeType: r.category,
      urgency: r.urgency,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      contractor: r.tradesCompany
        ? {
            name: r.tradesCompany.name,
            logo: r.tradesCompany.logo,
          }
        : null,
    }));

    return NextResponse.json({ requests: transformed });
  } catch (error) {
    console.error("[WorkRequest GET] Error:", error);
    return NextResponse.json({ requests: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      type,
      category,
      jobCategory,
      address,
      description,
      urgency,
      targetProId,
      photos,
    } = body;

    if (!type && !category) {
      return NextResponse.json({ error: "Category/type is required" }, { status: 400 });
    }

    // Find or create client
    let client = await prisma.client.findUnique({
      where: { userId: user.id },
    });

    if (!client) {
      // Auto-create client profile if missing
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      const displayName =
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || email.split("@")[0];

      client = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          userId: user.id,
          slug: `client-${user.id.slice(-8)}`,
          name: displayName,
          email,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          avatarUrl: user.imageUrl || null,
          category: "Homeowner",
          status: "active",
        },
      });
    }

    // Create work request using ClientWorkRequest model
    // jobCategory maps to the social board categories:
    // potential_claim, bidding_opportunity, repair, out_of_pocket, unsure
    const workRequest = await prisma.clientWorkRequest.create({
      data: {
        id: crypto.randomUUID(),
        clientId: client.id,
        targetProId: targetProId || null,
        title: title || `${category || type} Request`,
        description: description || "",
        category: jobCategory || category || type,
        urgency: urgency || "normal",
        propertyAddress: address || null,
        propertyPhotos: photos || [],
        status: "pending",
      },
    });

    console.log("[WorkRequest] Created:", {
      id: workRequest.id,
      clientId: client.id,
      category: workRequest.category,
    });

    // Send notification to target pro if specified
    if (targetProId) {
      try {
        // Collect all userIds to notify (company members + owner)
        const recipientIds = new Set<string>();

        // Find pro members via company membership
        const proMembers = await prisma.tradesCompanyMember.findMany({
          where: { companyId: targetProId },
          select: { userId: true },
        });
        proMembers.forEach((m) => recipientIds.add(m.userId));

        // Also check the company owner userId
        const targetCompany = await prisma.tradesCompany.findUnique({
          where: { id: targetProId },
          select: { userId: true },
        });
        if (targetCompany?.userId) {
          recipientIds.add(targetCompany.userId);
        }

        for (const recipientId of recipientIds) {
          await prisma.tradeNotification.create({
            data: {
              recipientId,
              type: "new_work_request",
              title: "New Work Request",
              message: `${client.name || "A client"} sent you a work request: ${workRequest.title}`,
              actionUrl: "/trades/jobs",
              metadata: {
                workRequestId: workRequest.id,
                clientId: client.id,
                clientName: client.name,
                category: workRequest.category,
                urgency: workRequest.urgency,
              },
            },
          });
        }
        console.log(
          `[WorkRequest] Notified ${recipientIds.size} pro users for company ${targetProId}`
        );
      } catch (notifErr) {
        // Non-fatal
        console.warn("[WorkRequest] Failed to create notification:", notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      requestId: workRequest.id,
      message: "Work request submitted successfully",
    });
  } catch (error) {
    console.error("[WorkRequest] Error:", error);
    return NextResponse.json({ error: "Failed to submit work request" }, { status: 500 });
  }
}
