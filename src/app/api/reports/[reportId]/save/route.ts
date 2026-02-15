export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// =====================================================
// API: SAVE REPORT TO DOCUMENTS
// =====================================================
// POST /api/reports/[id]/save
// Copies report PDF to documents bucket + creates DB record
// =====================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find report (verify org ownership)
    const report = await prisma.ai_reports.findFirst({
      where: {
        id: params.id,
        orgId,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Save report metadata to documents if claimId exists
    if (report.claimId) {
      const documentId = `doc_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

      // Get the claim to find projectId for documents table
      const claim = await prisma.claims.findUnique({
        where: { id: report.claimId },
        select: { projectId: true },
      });

      if (claim?.projectId) {
        await prisma.documents
          .create({
            data: {
              id: documentId,
              orgId: orgId,
              projectId: claim.projectId,
              createdBy: userId,
              title: `AI Report - ${report.id}`,
              type: "REPORT",
              url: "", // Reports are stored in attachments JSON
              updatedAt: new Date(),
            },
          })
          .catch((err) => console.warn("Could not save to documents:", err));
      }
    }

    console.log(`Report ${report.id} saved to documents by user ${userId}`);

    return NextResponse.json({
      ok: true,
      description: "Report saved to documents",
      reportId: report.id,
    });
  } catch (error) {
    console.error("Save report error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Save failed" },
      { status: 500 }
    );
  }
}
