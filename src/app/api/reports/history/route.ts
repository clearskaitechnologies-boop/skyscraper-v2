import { NextResponse } from "next/server";

import { getCurrentUserRole, requirePermission } from "@/lib/auth/rbac";
import { withSentryApi } from "@/lib/monitoring/sentryApi";
import prisma from "@/lib/prisma";

// GET /api/reports/history - list reports for current org
export const GET = withSentryApi(async function GET() {
  try {
    await requirePermission("reports:view");
    const ctx = await getCurrentUserRole();
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.ai_reports.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ reports: items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to load reports" }, { status: 500 });
  }
});

// POST /api/reports/history - create new report entry
export const POST = withSentryApi(async function POST(req: Request) {
  try {
    await requirePermission("reports:create");
    const ctx = await getCurrentUserRole();
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { type, sourceId, title, fileUrl, metadata } = body;

    if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

    const created = await prisma.ai_reports.create({
      data: {
        id: `rh_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        orgId: ctx.orgId,
        userId: ctx.userId,
        userName: "User", // Required field
        type,
        claimId: sourceId || null, // Map sourceId to claimId
        title: title || "Untitled Report",
        content: "", // Required field - can be populated later
        tokensUsed: 0,
        updatedAt: new Date(),
        attachments: metadata ? { fileUrl, ...metadata } : null,
      },
    });

    return NextResponse.json({ report: created });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to create report entry" },
      { status: 500 }
    );
  }
});
