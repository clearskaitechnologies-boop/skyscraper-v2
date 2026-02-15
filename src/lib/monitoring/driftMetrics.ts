// In-memory drift metrics counters (ephemeral; resets on redeploy)
// Each safe selector increments fallback count when schema drift detected.

type DriftCounters = {
  users: number;
  claims: number;
  leads: number;
  projects: number;
  jobs: number;
};

const counters: DriftCounters = {
  users: 0,
  claims: 0,
  leads: 0,
  projects: 0,
  jobs: 0,
};

const startedAt = Date.now();

export function incrementDrift(model: keyof DriftCounters) {
  counters[model]++;
}

export function getDriftMetrics() {
  return {
    startedAt,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    counters: { ...counters },
    totalFallbacks: Object.values(counters).reduce((a, b) => a + b, 0),
  };
}

export function resetDriftMetrics() {
  (Object.keys(counters) as (keyof DriftCounters)[]).forEach(k => (counters[k] = 0));
}
