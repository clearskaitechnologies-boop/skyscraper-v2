/**
 * GET /api/smart-docs/envelopes
 *
 * Returns all e-sign envelopes for the current organization.
 * Used by the Smart Documents hub page.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const envelopes = await prisma.signatureEnvelope.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        documentName: true,
        status: true,
        signerEmail: true,
        signerName: true,
        signerRole: true,
        sentAt: true,
        signedAt: true,
        createdAt: true,
        claimId: true,
        documentUrl: true,
        signedDocumentUrl: true,
      },
    });

    return NextResponse.json({ ok: true, envelopes });
  } catch (error) {
    console.error("[SMART_DOCS_LIST_ERROR]", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to load documents",
      },
      { status: 500 }
    );
  }
}
