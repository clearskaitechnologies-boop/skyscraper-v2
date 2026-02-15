export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

import { getApiToken } from '@/lib/apiTokens';
import { getFlagCache, logCacheEvent,setFlagCache } from '@/lib/flagCache';
import { withSentryApi } from '@/lib/monitoring/sentryApi';
import prisma from "@/lib/prisma";

// Cache key for list (org-specific + global)
function listCacheKey(orgId?: string | null, search?: string|null, enabled?: string|null, limit?: number, offset?: number) {
  return `flags:list:${orgId || 'global'}:${search||''}:${enabled||''}:${limit||''}:${offset||''}`;
}

export const GET = withSentryApi(async (req: Request) => {
  const apiKey = req.headers.get('x-api-key');
  let orgId: string | null = null;
  if (apiKey) {
    const token = await getApiToken(apiKey, ['read:flags']);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    orgId = token.org_id;
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const enabledFilter = searchParams.get('enabled'); // 'true'|'false' or null
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

  const cacheKey = listCacheKey(orgId, search, enabledFilter, limit, offset);
  const cacheHit = await getFlagCache(cacheKey);
  if (cacheHit) {
    logCacheEvent('hit', cacheKey);
    try { return NextResponse.json(JSON.parse(cacheHit)); } catch {}
  }
  logCacheEvent('miss', cacheKey);

  let rows: any[] = [];
  try {
    rows = await prisma.$queryRawUnsafe(
      `SELECT key, enabled, org_id, last_access_at, rollout_percent, targeting
       FROM app.feature_flags
       WHERE (org_id IS NULL OR org_id = $1)
         AND ($2::text IS NULL OR key ILIKE '%' || $2 || '%')
       ORDER BY key, org_id DESC NULLS LAST`,
      orgId || null,
      search || null
    );
  } catch {
    rows = await prisma.$queryRawUnsafe(
      `SELECT key, enabled, org_id, last_access_at
       FROM app.feature_flags
       WHERE (org_id IS NULL OR org_id = $1)
         AND ($2::text IS NULL OR key ILIKE '%' || $2 || '%')
       ORDER BY key, org_id DESC NULLS LAST`,
      orgId || null,
      search || null
    );
  }

  // Reduce to single record per key (prefer org-specific)
  const map: Record<string, any> = {};
  for (const r of rows) {
    if (!map[r.key] || r.org_id) {
      // Normalize to API shape (camelCase) and include rolloutPercent + targeting metadata
      map[r.key] = {
        key: r.key,
        enabled: r.enabled,
        orgId: r.org_id,
        lastAccessAt: r.last_access_at,
        rolloutPercent: r.rollout_percent === undefined || r.rollout_percent === null ? 100 : r.rollout_percent,
        targeting: r.targeting ? (() => { try { return JSON.parse(r.targeting); } catch { return null; } })() : null,
      };
    }
  }
  let list: any[] = Object.values(map);
  if (enabledFilter === 'true') list = list.filter(f => f.enabled);
  if (enabledFilter === 'false') list = list.filter(f => !f.enabled);
  const paged = list.slice(offset, offset + limit);
  await setFlagCache(cacheKey, JSON.stringify({ total: list.length, items: paged }), 30);
  logCacheEvent('set', cacheKey);
  return NextResponse.json({ total: list.length, items: paged });
});
