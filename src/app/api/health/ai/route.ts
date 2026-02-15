import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY missing' }, { status: 500 });
  }
  try {
    // Lightweight capability check: list models (no heavy usage)
    const client = new OpenAI({ apiKey });
    let model: string | null = null;
    try {
      const models = await client.models.list();
      model = models.data?.[0]?.id || null;
    } catch {
      // Ignore model list failure; still report basic status
    }
    return NextResponse.json({ ok: true, model, ms: Date.now() - started });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, ms: Date.now() - started }, { status: 500 });
  }
}
