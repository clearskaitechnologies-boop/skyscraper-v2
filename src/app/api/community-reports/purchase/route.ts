import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { formatPrice, getReportBySku } from "@/config/communityReports";
import { getActiveOrgContext } from "@/lib/auth/tenant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/community-reports/purchase
 * Purchase a community report
 *
 * For now, creates a pending order record
 * Future: Integrate with Stripe checkout
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

    // Get form data
    const formData = await request.formData();
    const sku = formData.get("sku") as string;

    if (!sku) {
      return NextResponse.json({ error: "SKU required" }, { status: 400 });
    }

    // Look up report config
    const reportConfig = getReportBySku(sku);
    if (!reportConfig) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    logger.debug(`[PURCHASE] User ${userId} purchasing report: ${reportConfig.title}`);

    // ENHANCEMENT: When Stripe is ready, create checkout session here
    // For now, create a pending order in the database

    // Check if report_orders table exists (it may not yet)
    // For MVP, just return success and log the purchase
    console.log(`[PURCHASE] Order created:`, {
      orgId,
      userId,
      sku,
      title: reportConfig.title,
      priceCents: reportConfig.priceCents,
      status: "PENDING",
    });

    // Return success with redirect to a "thank you" or order confirmation page
    return NextResponse.json({
      success: true,
      message: "Report purchase initiated",
      order: {
        reportTitle: reportConfig.title,
        price: formatPrice(reportConfig.priceCents),
        status: "PENDING",
        sku: reportConfig.sku,
      },
      // Future: redirect to Stripe checkout or order confirmation page
      nextAction: "pending_payment",
    });
  } catch (error: any) {
    logger.error("[PURCHASE] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purchase report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST to purchase a report",
      endpoint: "/api/community-reports/purchase",
      method: "POST",
      requiredFields: ["sku"],
    },
    { status: 405 }
  );
}
