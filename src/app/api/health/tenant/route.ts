import { NextResponse } from 'next/server';

import { getOrCreateCurrentOrganization } from '@/lib/organizations';

// Lightweight logging wrapper to trace intermittent 500s
function log(msg: string, extra?: any) {
  // Avoid noisy logs in production unless failing
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[tenant-health] ${msg}`, extra || '');
  }
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    const org = await getOrCreateCurrentOrganization({ requireOrg: false, bootstrapIfMissing: false });
    const dur = Date.now() - start;
    log('success', { ms: dur, hasOrg: !!org });
    return NextResponse.json({
      ok: true,
      hasOrganization: !!org,
      organizationId: org?.id || null,
      name: org?.name || null,
      ms: dur,
    });
  } catch (e: any) {
    const dur = Date.now() - start;
    console.error('[tenant-health] error', { ms: dur, message: e?.message, stack: e?.stack });
    return NextResponse.json({ ok: false, error: e?.message || 'Tenant check failed', ms: dur }, { status: 500 });
  }
}
