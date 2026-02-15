/**
 * Orders API — GET (list) + POST (create)
 *
 * Uses the existing MaterialOrder + MaterialOrderItem Prisma models.
 * Scoped to the user's org via ensureUserOrgContext.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

// ── GET /api/trades/orders — List orders for the user's org ──
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orgId: string;
  try {
    orgId = (await ensureUserOrgContext(userId)).orgId;
  } catch {
    return NextResponse.json({ error: "Organization context required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // filter by status
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: any = { orgId };
  if (status) where.status = status;

  const [orders, stats] = await Promise.all([
    prisma.materialOrder.findMany({
      where,
      include: {
        MaterialOrderItem: true,
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    }),
    // Aggregate stats in one query
    prisma.materialOrder.groupBy({
      by: ["status"],
      where: { orgId },
      _count: true,
      _sum: { total: true },
    }),
  ]);

  // Build stats summary
  const statsMap: Record<string, { count: number; total: number }> = {};
  let totalSpent = 0;
  for (const s of stats) {
    statsMap[s.status] = {
      count: s._count,
      total: Number(s._sum.total || 0),
    };
    totalSpent += Number(s._sum.total || 0);
  }

  return NextResponse.json({
    ok: true,
    orders,
    stats: {
      active: (statsMap["draft"]?.count || 0) + (statsMap["ordered"]?.count || 0),
      inTransit: statsMap["shipped"]?.count || 0,
      delivered: (statsMap["delivered"]?.count || 0) + (statsMap["installed"]?.count || 0),
      totalSpent,
      byStatus: statsMap,
    },
  });
}

// ── POST /api/trades/orders — Create a new order ──
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let orgId: string;
  try {
    orgId = (await ensureUserOrgContext(userId)).orgId;
  } catch {
    return NextResponse.json({ error: "Organization context required" }, { status: 403 });
  }

  const body = await req.json();
  const { vendor, items, estimatedTotal, deliveryDate, notes, jobId, deliveryAddress } = body;

  if (!vendor) {
    return NextResponse.json({ error: "Vendor is required" }, { status: 400 });
  }

  // Generate order number: ORD-{timestamp}-{random}
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

  try {
    // Parse items text into MaterialOrderItem records if structured
    const parsedItems = parseItemsText(items);

    // Calculate total from items or use estimated total
    const total =
      parsedItems.length > 0
        ? parsedItems.reduce((sum, item) => sum + item.lineTotal, 0)
        : parseFloat(estimatedTotal?.replace(/[^0-9.]/g, "") || "0");

    const order = await prisma.materialOrder.create({
      data: {
        id: crypto.randomUUID(),
        orgId,
        vendor: vendor,
        orderNumber,
        status: "draft",
        orderType: "manual",
        deliveryAddress: deliveryAddress || "TBD",
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        specialInstructions: notes || null,
        subtotal: total,
        tax: 0,
        delivery: 0,
        total,
        updatedAt: new Date(),
        claimId: jobId || null,
        MaterialOrderItem:
          parsedItems.length > 0
            ? {
                create: parsedItems.map((item) => ({
                  id: crypto.randomUUID(),
                  category: item.category || "General",
                  productName: item.productName,
                  quantity: item.quantity,
                  unit: item.unit || "ea",
                  unitPrice: item.unitPrice,
                  lineTotal: item.lineTotal,
                })),
              }
            : undefined,
      },
      include: { MaterialOrderItem: true },
    });

    console.log(`[trades/orders POST] ✅ Created order ${order.orderNumber} for org ${orgId}`);

    return NextResponse.json({ ok: true, order }, { status: 201 });
  } catch (error) {
    console.error("[trades/orders POST] ❌ Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

/**
 * Parse free-text items into structured line items.
 * Supports formats like:
 *   "10x Shingle Bundle @ $45.00"
 *   "Underlayment - 3 rolls - $120"
 *   "Drip edge, 50ft, $85"
 */
function parseItemsText(text: string): Array<{
  category: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}> {
  if (!text?.trim()) return [];

  const lines = text.split("\n").filter((l) => l.trim());
  const items: Array<{
    category: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
  }> = [];

  for (const line of lines) {
    // Try to extract quantity and price
    const priceMatch = line.match(/\$[\d,.]+/);
    const qtyMatch =
      line.match(/^(\d+)\s*x\s*/i) || line.match(/(\d+)\s*(rolls?|bundles?|ea|pcs?|ft|lf|sq)/i);

    const price = priceMatch ? parseFloat(priceMatch[0].replace(/[$,]/g, "")) : 0;
    const quantity = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
    const unitPrice = quantity > 0 ? price / quantity : price;

    // Clean up product name
    let productName = line
      .replace(/\$[\d,.]+/g, "")
      .replace(/^\d+\s*x\s*/i, "")
      .replace(/[-–—,]\s*$/, "")
      .replace(/@\s*$/, "")
      .trim();

    if (!productName) productName = line.trim();

    items.push({
      category: "General",
      productName,
      quantity,
      unit: qtyMatch?.[2] || "ea",
      unitPrice,
      lineTotal: price || unitPrice * quantity,
    });
  }

  return items;
}
