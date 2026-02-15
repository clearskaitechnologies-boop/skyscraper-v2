import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  if (process.env.SENTRY_TEST === '1') {
    try {
      throw new Error('Sentry test: forced error');
    } catch (e) {
      // Re-throw to let Next.js / Sentry capture; still return JSON for curl visibility
      console.error('[sentry-test] captured', e);
      return NextResponse.json({ ok: false, error: (e as Error).message, captured: true }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, disabled: true });
}
