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
      return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const openai = ensureOpenAI();

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract all text from this image. Return only the extracted text, no additional commentary." },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
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
  } catch (e) {
    logger.error("OCR Image Error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
