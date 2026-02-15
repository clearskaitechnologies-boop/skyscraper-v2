// TODO: This route has 0 frontend callers. Well-built queue system that was never wired to UI.
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserPermissions } from "@/lib/permissions";
import {
  cancelReport,
  getQueueStats,
  getReportStatus,
  listRecentReports,
  queueReport,
} from "@/lib/reports/queue";

/**
 * POST /api/reports/queue - Queue a new report for generation
 * GET /api/reports/queue - List recent reports / get queue stats
 * GET /api/reports/queue?id=xxx - Get status of specific report
 * DELETE /api/reports/queue?id=xxx - Cancel a queued report
 */

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await getCurrentUserPermissions();
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 403 });
    }

    const body = await request.json();
    const { claimId, type, sections, options, notifyEmail, customTitle } = body;

    if (!claimId || !type) {
      return NextResponse.json({ error: "claimId and type are required" }, { status: 400 });
    }

    // Queue the report
    const reportId = await queueReport({
      orgId,
      claimId,
      type,
      config: {
        sections: sections || [],
        options: options || {},
        customTitle,
        generatedBy: userId,
      },
      notifyEmail,
      userId,
    });

    return NextResponse.json({
      ok: true,
      reportId,
      message: "Report queued for generation",
      statusUrl: `/api/reports/queue?id=${reportId}`,
    });
  } catch (error) {
    console.error("[/api/reports/queue POST] Error:", error);
    return NextResponse.json({ error: "Failed to queue report" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orgId } = await getCurrentUserPermissions();
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");
    const claimId = searchParams.get("claimId");
    const statsOnly = searchParams.get("stats") === "true";

    // Get status of specific report
    if (reportId) {
      const status = await getReportStatus(reportId);
      if (!status) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, ...status });
    }

    // Get queue stats only
    if (statsOnly) {
      const stats = await getQueueStats(orgId);
      return NextResponse.json({ ok: true, stats });
    }

    // List recent reports
    const reports = await listRecentReports(orgId, {
      claimId: claimId || undefined,
      limit: 50,
    });

    const stats = await getQueueStats(orgId);

    return NextResponse.json({
      ok: true,
      reports,
      stats,
    });
  } catch (error) {
    console.error("[/api/reports/queue GET] Error:", error);
    return NextResponse.json({ error: "Failed to get report status" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const cancelled = await cancelReport(reportId);

    if (!cancelled) {
      return NextResponse.json(
        { error: "Cannot cancel report (may already be processing)" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Report cancelled",
    });
  } catch (error) {
    console.error("[/api/reports/queue DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to cancel report" }, { status: 500 });
  }
}
