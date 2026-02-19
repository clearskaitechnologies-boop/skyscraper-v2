export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

import { withSentryApi } from '@/lib/monitoring/sentryApi';
import prisma from "@/lib/prisma";
import { requireAdmin } from '@/lib/security/roles';

export const GET = withSentryApi(async (req: Request) => {
  try {
    await requireAdmin();
    let rows: any[] = [];
    try {
      rows = await prisma.$queryRawUnsafe(
        'SELECT key, enabled, org_id, rollout_percent, targeting FROM app.feature_flags ORDER BY key, org_id DESC NULLS LAST'
      );
    } catch {
      rows = await prisma.$queryRawUnsafe(
        'SELECT key, enabled, org_id FROM app.feature_flags ORDER BY key, org_id DESC NULLS LAST'
      );
    }
    // Parse targeting JSON
    const flags = rows.map((r: any) => ({
      key: r.key,
      enabled: r.enabled,
      orgId: r.org_id,
      rolloutPercent: r.rollout_percent === undefined || r.rollout_percent === null ? 100 : r.rollout_percent,
      targeting: r.targeting ? (() => { try { return JSON.parse(r.targeting); } catch { return null; } })() : null,
    }));
    return NextResponse.json({ items: flags });
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'Unauthorized' }, { status: 401 });
  }
});
