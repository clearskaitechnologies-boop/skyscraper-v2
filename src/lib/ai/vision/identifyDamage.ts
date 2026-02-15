import { upstash } from '@/lib/upstash';

/**
 * identifyDamage
 * ----------------------------------------------
 * Detects and categorizes visible damage indicators:
 * - Missing shingles / creased / torn
 * - Impact marks (hail)
 * - Wind uplift indicators
 * - Granule loss patterns
 * - Accessory damage (vents, flashing, gutters)
 */
export async function identifyDamage(options: {
  orgId: string;
  claimId: string;
  photoIds: string[];
}): Promise<{ damages: any; riskFlags: any; meta: { cached?: boolean } }> {
  const redis = upstash;
  const jobKey = `aiq:damage:${options.claimId}`;
  if (redis) {
    try {
      const cached = await redis.get(jobKey);
      if (cached) return { ...(cached as any), meta: { cached: true } };
    } catch {}
  }

  // TODO: Vision-based classification + heuristic scoring
  const damages = { items: [], severityScore: 0 };
  const riskFlags = { interiorRisk: false, futureLeakPotential: false, notes: [] };

  if (redis) { try { await redis.setex(jobKey, 3600, JSON.stringify({ damages, riskFlags })); } catch {} }
  return { damages, riskFlags, meta: {} };
}
