/**
 * POST /api/measurements/order
 * GET  /api/measurements/order?orderId=xxx
 *
 * Order roof measurements through GAF QuickMeasure and track them.
 * Requires org auth. Creates a measurement_orders record and dispatches to GAF.
 */

import { withAuth } from "@/lib/auth/withAuth";
import { getGAFClient, summarizeMeasurements, type GAFMeasurements } from "@/lib/integrations/gaf";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET — Check order status
 */
export const GET = withAuth(async (req: NextRequest, { orgId }) => {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");

  if (orderId) {
    const order = await prisma.measurement_orders.findFirst({
      where: { id: orderId, org_id: orgId },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If pending/processing, check with GAF for live status
    if (order.status === "pending" || order.status === "processing") {
      try {
        const gaf = getGAFClient(orgId);
        if (order.external_id) {
          const liveStatus = await gaf.getOrderStatus(order.external_id);
          if (liveStatus.status !== order.status) {
            await prisma.measurement_orders.update({
              where: { id: order.id },
              data: {
                status: liveStatus.status,
                ...(liveStatus.reportUrl ? { report_url: liveStatus.reportUrl } : {}),
                ...(liveStatus.measurements
                  ? { measurements: liveStatus.measurements as unknown as Record<string, unknown> }
                  : {}),
                ...(liveStatus.status === "completed" ? { completed_at: new Date() } : {}),
              },
            });
          }
        }
      } catch {
        // Non-critical — return DB state
      }
    }

    const freshOrder = await prisma.measurement_orders.findFirst({
      where: { id: orderId, org_id: orgId },
    });

    // Include summary if measurements exist
    let summary = null;
    if (freshOrder?.measurements && typeof freshOrder.measurements === "object") {
      try {
        summary = summarizeMeasurements(freshOrder.measurements as unknown as GAFMeasurements);
      } catch {
        // Measurements data may not match expected format
      }
    }

    return NextResponse.json({ ok: true, order: freshOrder, summary });
  }

  // List all orders for org
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = { org_id: orgId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.measurement_orders.findMany({
      where,
      orderBy: { ordered_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.measurement_orders.count({ where }),
  ]);

  return NextResponse.json({ ok: true, orders, total, page, limit });
});

/**
 * POST — Place a new measurement order
 */
export const POST = withAuth(async (req: NextRequest, { orgId, userId }) => {
  try {
    const body = await req.json();
    const { address, orderType, claimId, jobId, urgency, notes } = body;

    if (!address?.street || !address?.city || !address?.state || !address?.zip) {
      return NextResponse.json(
        { error: "Complete address required (street, city, state, zip)" },
        { status: 400 }
      );
    }

    // Create local order record
    const localOrder = await prisma.measurement_orders.create({
      data: {
        org_id: orgId,
        claim_id: claimId || null,
        job_id: jobId || null,
        property_address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        city: address.city,
        state: address.state,
        zip: address.zip,
        provider: "gaf",
        order_type: orderType || "roof",
        status: "pending",
        ordered_by: userId,
      },
    });

    // Dispatch to GAF API
    try {
      const gaf = getGAFClient(orgId);
      const callbackUrl = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/measurements/webhook`
        : "https://skaiscrape.com/api/measurements/webhook";

      const gafOrder = await gaf.orderMeasurement({
        address,
        orderType: orderType || "roof",
        callbackUrl,
        customerRef: `org:${orgId}|order:${localOrder.id}`,
        notes,
        urgency: urgency || "standard",
      });

      // Update with GAF's external reference
      await prisma.measurement_orders.update({
        where: { id: localOrder.id },
        data: {
          external_id: gafOrder.orderId,
          status: gafOrder.status,
          metadata: {
            gafResponse: gafOrder,
            estimatedCompletion: gafOrder.estimatedCompletionTime,
          },
        },
      });

      logger.info(`[MEASUREMENTS] Order ${localOrder.id} dispatched to GAF: ${gafOrder.orderId}`);

      return NextResponse.json({
        ok: true,
        orderId: localOrder.id,
        gafOrderId: gafOrder.orderId,
        status: gafOrder.status,
        estimatedCompletion: gafOrder.estimatedCompletionTime,
      });
    } catch (gafErr) {
      // If GAF dispatch fails, keep local order in pending state
      logger.error("[MEASUREMENTS] GAF dispatch failed:", gafErr);

      await prisma.measurement_orders.update({
        where: { id: localOrder.id },
        data: {
          metadata: {
            gafDispatchError: gafErr instanceof Error ? gafErr.message : "Unknown error",
            gafDispatchAttemptedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({
        ok: true,
        orderId: localOrder.id,
        status: "pending",
        warning: "Order saved locally but GAF dispatch failed. Will retry automatically.",
      });
    }
  } catch (error) {
    logger.error("[MEASUREMENTS_ORDER]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
});
