import { randomUUID } from "crypto";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

// ITEM 14: Material orders API
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    const body = await req.json();
    const { claimId, materialId, quantity, unitPrice, deliveryAddress } = body;

    if (!claimId || !materialId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get material details from VendorProduct
    const material = await prisma.vendorProduct.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Use provided unitPrice or default to 0
    const price = unitPrice ? Number(unitPrice) : 0;
    const lineTotal = price * quantity;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`;

    // Create material order with item
    const order = await prisma.materialOrder.create({
      data: {
        id: randomUUID(),
        orgId,
        claimId,
        orderNumber,
        vendor: material.vendorId,
        orderType: "standard",
        deliveryAddress: deliveryAddress || "TBD",
        subtotal: lineTotal,
        total: lineTotal,
        updatedAt: new Date(),
        MaterialOrderItem: {
          create: {
            id: randomUUID(),
            category: "materials",
            productName: material.name,
            quantity,
            unit: "each",
            unitPrice: price,
            lineTotal,
          },
        },
      },
      include: {
        MaterialOrderItem: true,
      },
    });

    // Create workflow event for job timeline integration
    try {
      await prisma.vendor_workflow_events.create({
        data: {
          id: crypto.randomUUID(),
          orgId: orgId,
          claimId: claimId,
          eventType: "ORDER_PLACED",
          entityType: "material_order",
          entityId: order.id,
          payload: {
            orderId: order.id,
            orderNumber,
            materialName: material.name,
            quantity,
            unitPrice: price,
            total: lineTotal,
            timestamp: new Date().toISOString(),
            vendorId: material.vendorId,
          },
        },
      });
    } catch (eventError) {
      // Non-blocking - log but don't fail the order
      console.error("[WORKFLOW EVENT] Failed to create event:", eventError);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error("Material order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// Get material orders for a claim
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId } = auth;

    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");

    const orders = await prisma.materialOrder.findMany({
      where: claimId ? { claimId, orgId } : { orgId },
      orderBy: { createdAt: "desc" },
      include: {
        MaterialOrderItem: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    logger.error("Material order fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
