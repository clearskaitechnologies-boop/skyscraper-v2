import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getReportBySku } from "@/config/communityReports";
import { getActiveOrgContext } from "@/lib/auth/tenant";
import prisma from "@/lib/prisma";
import { generateCommunityReport } from "@/lib/reports/communityEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/reports/community/generate
 * Generate a community report (consumes 1 credit)
 */
export async function POST(request: Request) {
  try {
    // Require auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active org
    const orgContext = await getActiveOrgContext();
    if (!orgContext.ok || !orgContext.orgId) {
      const errorDetails = !orgContext.ok ? orgContext.error : undefined;
      return NextResponse.json(
        { error: "No organization found", details: errorDetails },
        { status: 400 }
      );
    }

    const orgId = orgContext.orgId;

    // Get request body
    const body = await request.json();
    const { sku } = body;

    if (!sku) {
      return NextResponse.json({ error: "SKU required" }, { status: 400 });
    }

    // Look up report config
    const reportConfig = getReportBySku(sku);
    if (!reportConfig) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    console.log(`[GENERATE] User ${userId} generating report: ${reportConfig.title}`);

    // Create order record
    const orderResult = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO community_report_order (
        org_id, report_type, report_sku, status, consumed_credits
      )
      VALUES (
        ${orgId}::uuid,
        ${reportConfig.type},
        ${reportConfig.sku},
        'CREATED',
        1
      )
      RETURNING id
    `;

    const orderId = orderResult[0].id;

    console.log(`[GENERATE] Created order ${orderId}`);

    // Generate report asynchronously (in background)
    // For MVP, we'll await it, but in production this should be queued
    try {
      const result = await generateCommunityReport({
        orderId,
        reportSku: reportConfig.sku,
        orgId,
      });

      return NextResponse.json({
        success: true,
        orderId,
        reportTitle: reportConfig.title,
        artifactUrl: result.artifactUrl,
        creditsRemaining: consumeResult.newBalance,
        message: "Report generated successfully",
      });
    } catch (generateError: any) {
      console.error("[GENERATE] Report generation failed:", generateError);

      // Return partial success - order created and credit consumed
      return NextResponse.json(
        {
          success: false,
          orderId,
          error: "Report generation failed",
          message: "Credit consumed but generation failed. Check order history.",
          creditsRemaining: consumeResult.newBalance,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[GENERATE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST to generate a report",
      endpoint: "/api/reports/community/generate",
      method: "POST",
      requiredFields: ["sku"],
    },
    { status: 405 }
  );
}
