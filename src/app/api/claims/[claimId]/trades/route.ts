export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trades = await prisma.claimTradePartner.findMany({
      where: { claimId: params.claimId },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({ success: true, trades });
  } catch (error) {
    console.error("Failed to fetch claim trades:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { companyId, role, notes, estimatedCost } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    const trade = await prisma.claimTradePartner.create({
      data: {
        claimId: params.claimId,
        companyId,
        role: role || "subcontractor",
        assignedBy: userId,
        notes,
        estimatedCost: estimatedCost ? Math.round(estimatedCost * 100) : null,
      },
    });

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This trade partner is already assigned to this claim" },
        { status: 409 }
      );
    }
    console.error("Failed to link trade:", error);
    return NextResponse.json({ error: "Failed to link trade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    await prisma.claimTradePartner.deleteMany({
      where: {
        claimId: params.claimId,
        companyId,
      },
    });

    return NextResponse.json({ success: true, message: "Trade partner unlinked" });
  } catch (error) {
    console.error("Failed to unlink trade:", error);
    return NextResponse.json({ error: "Failed to unlink trade" }, { status: 500 });
  }
}
