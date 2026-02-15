/**
 * Single Order API — GET / PUT / DELETE
 *
 * GET  /api/trades/orders/[id] — Fetch single order with items
 * PUT  /api/trades/orders/[id] — Update order (status, fields)
 * DELETE /api/trades/orders/[id] — Delete order (draft only)
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

const VALID_STATUSES = ["draft", "ordered", "shipped", "delivered", "installed", "cancelled"];

// ── GET /api/trades/orders/[id] ──
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orgId: string;
  try {
    orgId = (await ensureUserOrgContext(userId)).orgId;
  } catch {
    return NextResponse.json({ error: "Organization context required" }, { status: 403 });
  }

  const order = await prisma.materialOrder.findFirst({
    where: { id: params.id, orgId },
    include: {
      MaterialOrderItem: true,
      claims: { select: { id: true, status: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order });
}

// ── PUT /api/trades/orders/[id] — Update order ──
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orgId: string;
  try {
    orgId = (await ensureUserOrgContext(userId)).orgId;
  } catch {
    return NextResponse.json({ error: "Organization context required" }, { status: 403 });
  }

  const existing = await prisma.materialOrder.findFirst({
    where: { id: params.id, orgId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await req.json();
  const updateData: Record<string, any> = { updatedAt: new Date() };

  // Status transition
  if (body.status && VALID_STATUSES.includes(body.status)) {
    updateData.status = body.status;

    // Auto-set timestamps on status changes
    if (body.status === "delivered") {
      updateData.deliveredAt = new Date();
    }
  }

  // Updatable fields
  if (body.deliveryAddress !== undefined) updateData.deliveryAddress = body.deliveryAddress;
  if (body.specialInstructions !== undefined)
    updateData.specialInstructions = body.specialInstructions;
  if (body.expectedDelivery !== undefined)
    updateData.expectedDelivery = body.expectedDelivery ? new Date(body.expectedDelivery) : null;
  if (body.poNumber !== undefined) updateData.poNumber = body.poNumber;
  if (body.confirmationNumber !== undefined)
    updateData.confirmationNumber = body.confirmationNumber;
  if (body.trackingNumber !== undefined) updateData.trackingNumber = body.trackingNumber;
  if (body.receivedBy !== undefined) updateData.receivedBy = body.receivedBy;
  if (body.total !== undefined) updateData.total = parseFloat(body.total) || 0;
  if (body.subtotal !== undefined) updateData.subtotal = parseFloat(body.subtotal) || 0;
  if (body.tax !== undefined) updateData.tax = parseFloat(body.tax) || 0;

  try {
    const order = await prisma.materialOrder.update({
      where: { id: params.id },
      data: updateData,
      include: { MaterialOrderItem: true },
    });

    console.log(`[trades/orders PUT] ✅ Updated order ${order.orderNumber} status=${order.status}`);

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("[trades/orders PUT] ❌ Error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// ── DELETE /api/trades/orders/[id] — Delete draft orders only ──
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orgId: string;
  try {
    orgId = (await ensureUserOrgContext(userId)).orgId;
  } catch {
    return NextResponse.json({ error: "Organization context required" }, { status: 403 });
  }

  const existing = await prisma.materialOrder.findFirst({
    where: { id: params.id, orgId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Only allow deleting draft orders
  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft orders can be deleted. Cancel the order instead." },
      { status: 400 }
    );
  }

  // Delete items first, then order
  await prisma.materialOrderItem.deleteMany({ where: { orderId: params.id } });
  await prisma.materialOrder.delete({ where: { id: params.id } });

  console.log(`[trades/orders DELETE] ✅ Deleted draft order ${existing.orderNumber}`);

  return NextResponse.json({ ok: true });
}
