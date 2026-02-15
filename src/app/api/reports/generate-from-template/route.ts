// TODO: This route has 0 frontend callers. Template-based generation exists but isn't wired.
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { buildClaimContext } from "@/lib/claim/buildClaimContext";
import { generatePdfFromAI } from "@/lib/pdf/generatePdfFromAI";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/reports/generate-from-template
 *
 * Generates an AI-powered PDF report using Template → AI → PDF pipeline
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { claimId, templateId, documentName } = body;

    if (!claimId || !templateId) {
      return NextResponse.json(
        { error: "Missing required fields: claimId, templateId" },
        { status: 400 }
      );
    }

    // Fetch template
    const template = await prisma.report_templates
      .findUnique({
        where: { id: templateId },
      })
      .catch(() => null);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Fetch claim
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Build comprehensive claim context
    const claimContext = await buildClaimContext(claimId);

    // Create document record
    const documentId = `doc_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const document = await prisma.documents.create({
      data: {
        id: documentId,
        orgId: claim.orgId,
        projectId: claimId,
        type: "OTHER",
        title: documentName || template.name,
        url: "", // Will be updated after generation
        updatedAt: new Date(),
      },
    });

    console.log(`[TEMPLATE_GEN] Starting: ${document.id}`);

    // Generate PDF
    try {
      const result = await generatePdfFromAI({
        template,
        inputs: claimContext,
        documentId: document.id,
        orgId: claim.orgId,
      });

      // Update document with file URL
      await prisma.documents.update({
        where: { id: document.id },
        data: {
          url: result.url,
          sizeBytes: result.size,
          updatedAt: new Date(),
        },
      });

      console.log(`[TEMPLATE_GEN] ✅ Complete: ${document.id}`);

      return NextResponse.json({
        success: true,
        documentId: document.id,
        downloadUrl: result.url,
        checksum: result.checksum,
      });
    } catch (error) {
      // Delete failed document record
      await prisma.documents
        .delete({
          where: { id: document.id },
        })
        .catch(() => {
          /* ignore cleanup errors */
        });

      throw error;
    }
  } catch (error) {
    console.error("[TEMPLATE_GEN] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate report",
      },
      { status: 500 }
    );
  }
}
