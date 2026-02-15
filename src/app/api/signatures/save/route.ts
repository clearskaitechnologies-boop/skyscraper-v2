import { NextRequest, NextResponse } from "next/server";

import { saveSignature } from "@/lib/signatures/saveSignature";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, signerName, signerEmail, role, signature } = body;

    if (!documentId || !signerName || !signerEmail || !role || !signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await saveSignature({
      documentId,
      signerName,
      signerEmail,
      role,
      signature,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Signature save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save signature" },
      { status: 500 }
    );
  }
}
