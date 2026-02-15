import { upstash } from '@/lib/upstash';

/**
 * generateScope
 * ----------------------------------------------
 * Combines measurements, materials, and damage signals into a draft scope:
 * - Line items per trade (roofing first)
 * - Suggested quantities (squares, LF, counts)
 * - Code upgrade suggestions (ridge vent, drip edge, ice & water)
 * - Risk-based recommendations (deck replacement, ventilation)
 */
export async function generateScope(options: {
  orgId: string;
  claimId: string;
  components: any;
  damages: any;
  materials: any;
  codeFlags?: any;
}): Promise<{ scope: any; meta: { cached?: boolean } }> {
  const redis = upstash;
  const jobKey = `aiq:scope:${options.claimId}`;
  if (redis) {
    try {
      const cached = await redis.get(jobKey);
      if (cached) return { ...(cached as any), meta: { cached: true } };
    } catch {}
  }

  // TODO: Assemble line items with estimation heuristics + AI refinement
  const scope = {
    trades: [
      {
        trade: 'roofing',
        items: [], // {code, description, qty, unit, notes}
      },
    ],
    assumptions: [],
    disclaimers: [],
  };

  if (redis) { try { await redis.setex(jobKey, 3600, JSON.stringify({ scope })); } catch {} }
  return { scope, meta: {} };
}
