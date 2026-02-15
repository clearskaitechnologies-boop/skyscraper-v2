import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { calculatePricePerHome, calculateTotalPrice } from "@/lib/pricing/batchProposalPricing";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      homeCount,
      stormType,
      manufacturer = "GAF",
      addressSource,
      addressData,
      stormDateStart,
      stormDateEnd,
    } = body;

    // Validate
    if (!homeCount || homeCount < 1) {
      return NextResponse.json({ error: "Invalid home count" }, { status: 400 });
    }

    if (!stormType || !["hail", "wind", "both"].includes(stormType)) {
      return NextResponse.json({ error: "Invalid storm type" }, { status: 400 });
    }

    if (!addressSource || !["csv", "manual", "map"].includes(addressSource)) {
      return NextResponse.json({ error: "Invalid address source" }, { status: 400 });
    }

    // Calculate pricing (SERVER TRUTH)
    const pricePerHome = calculatePricePerHome(homeCount);
    const totalPrice = calculateTotalPrice(homeCount);

    const batchJob = await prisma.batchJob.create({
      data: {
        orgId,
        type: "batch_proposal",
        status: "queued",
        totalItems: homeCount,
        createdBy: userId,
        inputData: {
          name: name || `Batch Proposal - ${homeCount} homes`,
          homeCount,
          pricePerHome,
          totalPrice,
          stormType,
          manufacturer,
          addressSource,
          addressData: addressData || null,
          stormDateStart: stormDateStart || null,
          stormDateEnd: stormDateEnd || null,
        },
      },
    });

    // Notify org admins about new batch proposal
    try {
      await prisma.tradeNotification.create({
        data: {
          recipientId: orgId,
          type: "batch_proposal_created",
          title: "New Batch Proposal Created",
          message: `Batch proposal for ${homeCount} homes ($${totalPrice.toFixed(2)}) is pending review.`,
          actionUrl: `/batch-proposals/${batchJob.id}`,
          metadata: { batchJobId: batchJob.id, homeCount, totalPrice },
        },
      });
    } catch (_) {
      // Non-fatal
    }

    return NextResponse.json({
      batchJob: {
        id: batchJob.id,
        orgId: batchJob.orgId,
        name: name || `Batch Proposal - ${homeCount} homes`,
        status: batchJob.status,
        homeCount,
        pricePerHome,
        totalPrice,
        stormType,
        manufacturer,
        addressSource,
        createdAt: batchJob.createdAt,
      },
    });
  } catch (error) {
    console.error("[BatchProposal Create Error]", error);
    return NextResponse.json({ error: "Failed to create batch job" }, { status: 500 });
  }
}
