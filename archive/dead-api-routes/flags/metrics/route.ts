export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { getApiToken } from '@/lib/apiTokens';
import { withSentryApi } from '@/lib/monitoring/sentryApi';
import prisma from "@/lib/prisma";

export const GET = withSentryApi(async (req: Request) => {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = await getApiToken(apiKey, ['read:flags']);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = token.org_id;

  // Last 7 days usage aggregation
  const usage: any[] = await prisma.$queryRawUnsafe(
    'SELECT key, date, hits FROM app.feature_flag_usage WHERE (org_id = $1 OR org_id IS NULL) AND date >= CURRENT_DATE - INTERVAL \'6 days\' ORDER BY key, date',
    orgId || null
  );

  // Shape into { key: { dates: [{date,hits}], total, spike: boolean, spikeRatio?: number } }
  const agg: Record<string, { key: string; total: number; dates: { date: string; hits: number }[]; spike: boolean; spikeRatio?: number }> = {};
  for (const u of usage) {
    if (!agg[u.key]) agg[u.key] = { key: u.key, total: 0, dates: [], spike: false };
    agg[u.key].dates.push({ date: u.date, hits: u.hits });
    agg[u.key].total += u.hits;
  }
  const thresholdEnv = process.env.FLAG_SPIKE_THRESHOLD;
  const spikeThreshold = thresholdEnv ? parseInt(thresholdEnv) : 1000; // default
  const today = new Date().toISOString().slice(0,10);
  for (const k of Object.keys(agg)) {
    const record = agg[k];
    const todayHits = record.dates.find(d=> d.date === today)?.hits || 0;
    const yesterdayDate = new Date(Date.now()-86400000).toISOString().slice(0,10);
    const yesterdayHits = record.dates.find(d=> d.date === yesterdayDate)?.hits || 0;
    if (todayHits > spikeThreshold || (yesterdayHits > 0 && todayHits / yesterdayHits >= 5)) {
      record.spike = true;
      record.spikeRatio = yesterdayHits > 0 ? todayHits / yesterdayHits : undefined;
      Sentry.captureMessage(`FLAG_SPIKE: key=${record.key} today=${todayHits} yesterday=${yesterdayHits} threshold=${spikeThreshold}`);
    }
  }
  return NextResponse.json(Object.values(agg));
});
