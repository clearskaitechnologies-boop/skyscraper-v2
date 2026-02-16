/**
 * Community Report Generation Engine
 * Wraps the main report generator for community reports
 */

import { getReportById } from "@/config/communityReports";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { generateReport, type ReportConfig } from "@/lib/reports/generator";

export interface CommunityReportParams {
  orderId: string;
  reportSku: string;
  orgId: string;
}

/**
 * Generate community report
 * This is the main entry point called after credit consumption
 */
export async function generateCommunityReport(
  params: CommunityReportParams
): Promise<{ artifactUrl: string }> {
  const { orderId, reportSku, orgId } = params;

  logger.debug(`[COMMUNITY_REPORT] Starting generation for order: ${orderId}`);

  try {
    // Update order status to GENERATING
    await prisma.$executeRaw`
      UPDATE community_report_order
      SET status = 'GENERATING', updated_at = NOW()
      WHERE id = ${orderId}::uuid
    `;

    // Get report config from SKU
    const reportType = await prisma.$queryRaw<Array<{ report_type: string }>>`
      SELECT report_type
      FROM community_report_order
      WHERE id = ${orderId}::uuid
    `;

    if (reportType.length === 0) {
      throw new Error("Order not found");
    }

    // Use the main report generator
    const reportConfig: ReportConfig = {
      type: "INSPECTION", // Community reports are inspection-type
      title: `Community Report - ${reportSku}`,
      resourceId: orderId,
      orgId,
      includePhotos: true,
      includeFinancials: false,
    };

    const generatedReport = await generateReport(reportConfig);

    // Update order with artifact URL
    await prisma.$executeRaw`
      UPDATE community_report_order
      SET 
        status = 'READY',
        artifact_url = ${generatedReport.url},
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${orderId}::uuid
    `;

    logger.debug(`[COMMUNITY_REPORT] Completed order ${orderId}: ${generatedReport.url}`);

    return {
      artifactUrl: generatedReport.url,
    };
  } catch (error: any) {
    logger.error(`[COMMUNITY_REPORT] Failed to generate order ${orderId}:`, error);

    // Mark order as failed
    try {
      await prisma.$executeRaw`
        UPDATE community_report_order
        SET 
          status = 'FAILED',
          metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{error}',
            to_jsonb(${error.message || "Unknown error"}::text)
          ),
          updated_at = NOW()
        WHERE id = ${orderId}::uuid
      `;
    } catch (updateError) {
      console.error("[COMMUNITY_REPORT] Failed to update order status:", updateError);
    }

    throw error;
  }
}

/**
 * Get community report orders for org
 */
export async function getCommunityReportOrders(orgId: string): Promise<any[]> {
  try {
    const orders = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        report_type,
        report_sku,
        status,
        artifact_url,
        consumed_credits,
        created_at,
        completed_at
      FROM community_report_order
      WHERE org_id = ${orgId}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return orders;
  } catch (error) {
    logger.error("[COMMUNITY_REPORT] Failed to get orders:", error);
    return [];
  }
}
