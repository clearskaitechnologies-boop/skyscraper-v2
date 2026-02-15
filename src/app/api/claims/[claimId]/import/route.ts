/**
 * POST /api/claims/[claimId]/import
 * Import adjuster or contractor estimates (CSV, Xactimate XML)
 *
 * NOTE: This endpoint is currently a stub. The scopeLineItem model was removed
 * from the schema. To implement this feature, use estimate_line_items through
 * the estimates model instead.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    // Authentication
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = await params;

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { source, format } = body;

    // Validate source
    if (source !== "ADJUSTER" && source !== "CONTRACTOR") {
      return NextResponse.json(
        { error: "Invalid source. Must be ADJUSTER or CONTRACTOR" },
        { status: 400 }
      );
    }

    // Validate format
    if (format !== "CSV" && format !== "XML") {
      return NextResponse.json({ error: "Invalid format. Must be CSV or XML" }, { status: 400 });
    }

    // TODO: Implement import using estimate_line_items model
    // The scopeLineItem model was removed from the schema.
    // This feature needs to be re-implemented using:
    // 1. Create an estimate record linked to the claim
    // 2. Create estimate_line_items records linked to the estimate

    return NextResponse.json(
      {
        error: "Import feature not yet implemented",
        message: "This endpoint is pending implementation with the new estimate_line_items schema",
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: "Failed to import estimate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claims/[claimId]/import
 * List all imported line items for a claim
 *
 * NOTE: This endpoint is currently a stub. The scopeLineItem model was removed
 * from the schema. To implement this feature, use estimate_line_items through
 * the estimates model instead.
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    // Authentication
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = await params;

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // TODO: Implement using estimate_line_items model
    // The scopeLineItem model was removed from the schema.
    // This feature needs to be re-implemented to fetch from:
    // 1. estimates table (filtered by claim_id and source type)
    // 2. estimate_line_items (joined via estimate_id)

    return NextResponse.json({
      adjuster: {
        items: [],
        total: 0,
        count: 0,
        matched: 0,
      },
      contractor: {
        items: [],
        total: 0,
        count: 0,
        matched: 0,
      },
      delta: 0,
      hasBothSources: false,
      message: "Import feature not yet implemented - scopeLineItem model was removed",
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch line items",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
