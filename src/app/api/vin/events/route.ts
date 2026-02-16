/**
 * VIN — Workflow Events API
 * GET /api/vin/events — Get vendor workflow events
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getActiveOrgContext();
    if (!ctx.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("claimId");
    const jobId = searchParams.get("jobId");
    const eventType = searchParams.get("eventType");
    const unprocessedOnly = searchParams.get("unprocessed") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = { orgId: ctx.orgId };
    if (claimId) where.claimId = claimId;
    if (jobId) where.jobId = jobId;
    if (eventType) where.eventType = eventType;
    if (unprocessedOnly) where.processed = false;

    const events = await prisma.vendor_workflow_events.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      events: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        entityType: e.entityType,
        entityId: e.entityId,
        claimId: e.claimId,
        jobId: e.jobId,
        payload: e.payload,
        processed: e.processed,
        processedAt: e.processedAt,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    logger.error("[VIN Events] Error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
