import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

// ITEM 14: Material orders API
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { claimId, materialId, quantity, unitPrice, deliveryAddress } = body;

    const missing: string[] = [];
    if (!claimId) missing.push("claimId");
    if (!materialId) missing.push("materialId");
    if (!quantity || quantity < 1) missing.push("quantity (must be ≥ 1)");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
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
      logger.warn("[WORKFLOW EVENT] Failed to create event:", eventError);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    logger.error("Material order error:", error);
    // Return descriptive error instead of generic message
    const message =
      error?.code === "P2002"
        ? "Duplicate order — this order already exists"
        : error?.code === "P2003"
          ? "Invalid reference — check that the claim and vendor exist"
          : error?.code === "P2025"
            ? "Related record not found — verify claim and material IDs"
            : error?.message?.includes("VendorProduct")
              ? "Material product not found in vendor catalog"
              : "Failed to create order — please check all fields and try again";
    return NextResponse.json({ error: message }, { status: 500 });
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
