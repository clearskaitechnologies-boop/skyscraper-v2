/**
 * GET /api/reports/view/[id]
 * PUT /api/reports/view/[id]
 * DELETE /api/reports/view/[id]
 *
 * View, update, or delete a specific report
 */

import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET - Fetch single report
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.ai_reports.findUnique({
      where: { id: params.id },
      include: {
        // Note: ai_reports has userId and userName instead of createdBy
        // Also has claims relation (not claim), no damageAssessment, estimate, supplement, or weatherReport
        claims: {
          select: {
            claimNumber: true,
            insured_name: true,
            propertyId: true,
          },
        },
      },
    });

    if (!report || report.orgId !== orgId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error: unknown) {
    console.error(`[GET /api/reports/view/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PUT - Update report
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, subtitle, lossType, dol, address, sections, summary, meta } = body;

    // Verify ownership
    const existing = await prisma.ai_reports.findUnique({
      where: { id: params.id },
      select: { orgId: true },
    });

    if (!existing || existing.orgId !== orgId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Update report
    const report = await prisma.ai_reports.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(lossType !== undefined && { lossType }),
        ...(dol !== undefined && { dol: dol ? new Date(dol) : null }),
        ...(address !== undefined && { address }),
        ...(sections !== undefined && { sections: sections as Prisma.InputJsonValue }),
        ...(summary !== undefined && { summary: summary as Prisma.InputJsonValue }),
        ...(meta !== undefined && { meta: meta as Prisma.InputJsonValue }),
      },
      // Note: ai_reports doesn't have createdBy relation
    });

    return NextResponse.json({ report });
  } catch (error: unknown) {
    console.error(`[PUT /api/reports/view/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update report" },
      { status: 500 }
    );
  }
}

// DELETE - Delete report
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = await prisma.ai_reports.findUnique({
      where: { id: params.id },
      select: { orgId: true },
    });

    if (!existing || existing.orgId !== orgId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Delete report
    await prisma.ai_reports.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(`[DELETE /api/reports/view/${params.id}] Error:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete report" },
      { status: 500 }
    );
  }
}
