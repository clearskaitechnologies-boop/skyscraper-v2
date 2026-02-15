import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getJson(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return await res.json();
  } catch (e: any) {
    return { ok: false, error: e?.message || 'fetch-failed' };
  }
}

export async function GET(req: Request) {
  const base = new URL(req.url).origin;
  const started = Date.now();
  const [db, storage, userCols, ai, voice] = await Promise.all([
    getJson(base + '/api/health/database'),
    getJson(base + '/api/health/storage'),
    getJson(base + '/api/health/user-columns'),
    getJson(base + '/api/health/ai'),
    getJson(base + '/api/health/voice'),
  ]);
  const ok = [db, storage, userCols, ai, voice].every(s => s.ok !== false);
  return NextResponse.json({
    ok,
    services: { db, storage, userColumns: userCols, ai, voice },
    ms: Date.now() - started,
    generatedAt: new Date().toISOString(),
  }, { status: ok ? 200 : 500 });
}
