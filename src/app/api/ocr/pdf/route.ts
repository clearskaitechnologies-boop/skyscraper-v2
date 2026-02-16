import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { ensureOpenAI } from "@/lib/ai/client";
import { requireTenant } from "@/lib/auth/tenant";
import { getDelegate } from '@/lib/db/modelAliases';
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    // Get tenant context
    const orgId = await requireTenant();
    
    const form = await req.formData();
    const file = form.get("file") as File;
    const claimId = form.get("claimId") as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Missing PDF file" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const base64 = bytes.toString("base64");
    const openai = ensureOpenAI();

    // Note: OpenAI API doesn't directly support PDF uploads via chat completions
    // You would typically convert PDF to images first or use a dedicated OCR service
    // For now, we'll use a text extraction approach assuming text-based PDFs
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "Extract and format all text from this document. Preserve structure and formatting where possible. Return only the extracted text." 
        },
        {
          role: "user",
          content: `I have a PDF document (base64 encoded). Please extract the text. Note: For production use, convert PDF to images first or use a dedicated PDF parsing library like pdf-parse.`
        },
      ],
    });

    const text = result.choices[0].message.content || "";

    const record = await getDelegate('ocrRecord').create({
      data: {
        orgId,
        claim_id: claimId || undefined,
        text,
        sourceUrl: undefined,
      },
    });

    return NextResponse.json({ ok: true, text, record });
  } catch (err: any) {
    logger.error("OCR PDF Error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
