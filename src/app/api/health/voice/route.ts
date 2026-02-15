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
    const client = new OpenAI({ apiKey });
    // Dry-run voice capability: check if "gpt-4o-mini-tts" (or similar) model exists
    let voiceCapable = false;
    try {
      const models = await client.models.list();
      voiceCapable = models.data.some(m => /tts|audio|speech/i.test(m.id));
    } catch {
      // ignore listing failure
    }
    return NextResponse.json({ ok: true, voiceCapable, ms: Date.now() - started });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, ms: Date.now() - started }, { status: 500 });
  }
}
