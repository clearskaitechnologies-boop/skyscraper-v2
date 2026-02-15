import { NextResponse } from "next/server";

import { saveClaimEmbeddings } from "@/lib/ai/embeddings";
import { requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { extractText } from "@/modules/ingest/core/extract";

/**
 * Phase 3.6: Background document embedding
 * Extract text from document and save to claim memory for semantic search
 */
async function embedDocumentAsync(
  documentId: string,
  orgId: string,
  claimId: string,
  url: string,
  title: string,
  sourceType: string
): Promise<void> {
  try {
    console.log(`[embedDocumentAsync] Starting for document: ${documentId}`);

    // Extract text from document (OCR if needed)
    const extraction = await extractText(url);
    const content = extraction.text;

    if (!content || content.trim().length === 0) {
      console.log(`[embedDocumentAsync] No text extracted from: ${title}`);
      return;
    }

    // Determine sourceType for memory chunk
    let memorySourceType: "document" | "letter" | "estimate" | "email" | "other" = "document";
    if (sourceType.toLowerCase().includes("letter")) {
      memorySourceType = "letter";
    } else if (sourceType.toLowerCase().includes("estimate")) {
      memorySourceType = "estimate";
    } else if (sourceType.toLowerCase().includes("email")) {
      memorySourceType = "email";
    }

    // Save embeddings to claim memory
    const result = await saveClaimEmbeddings({
      orgId,
      claimId,
      sourceType: memorySourceType,
      sourceId: documentId,
      title,
      content,
      metadata: {
        documentUrl: url,
        mimeType: extraction.confidence ? "text/plain" : undefined,
        ocrConfidence: extraction.confidence,
        embeddedAt: new Date().toISOString(),
      },
    });

    console.log(
      `[embedDocumentAsync] Success: ${result.chunksCreated} chunks created for "${title}"`
    );
  } catch (error) {
    console.error(`[embedDocumentAsync] Error for document ${documentId}:`, error);
    // Don't throw - this is fire-and-forget
  }
}

// MVP: accepts metadata only, storage integration deferred
export async function POST(req: Request) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;

    const data = await req.json();
    const { claimId, orgId: orgIdParam, title, url, type, mimeType, visibleToClient } = data;
    if (!claimId || !title || !url)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (orgIdParam && orgIdParam !== orgId)
      return NextResponse.json({ error: "Org mismatch" }, { status: 403 });

    // Ensure claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId: orgId ?? undefined },
      select: { id: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }
    const doc = await prisma.documents.create({
      data: {
        claimId,
        orgId: orgId ?? undefined,
        title,
        url,
        type: type ?? null,
        mimeType: mimeType ?? null,
        visibleToClient: !!visibleToClient,
      } as any,
    });

    // Phase 3.6: Auto-embed document content into claim memory (async, non-blocking)
    if (url && title) {
      embedDocumentAsync(doc.id, orgId!, claimId, url, title, type || "document").catch((err) => {
        console.error("[embedDocumentAsync] Failed for document:", doc.id, err);
      });
    }

    return NextResponse.json({ ok: true, document: doc });
  } catch (e: any) {
    console.error("[claims:document:upload]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
