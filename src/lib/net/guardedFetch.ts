// Lightweight build-phase aware fetch wrapper to suppress noisy ECONNRESET attempts
// Usage: await guardedFetch(url, opts) — returns { ok, data?, error?, skipped? }
// If running during build (BUILD_PHASE or NEXT_PHASE env markers) we skip external calls.

export type GuardedFetchResult<T=any> = {
  ok: boolean;
  status?: number;
  data?: T;
  error?: string;
  skipped?: boolean;
};

function isBuild() {
  return process.env.BUILD_PHASE === '1' || process.env.NEXT_PHASE === 'build';
}

export async function guardedFetch<T=any>(url: string, init?: RequestInit): Promise<GuardedFetchResult<T>> {
  // Skip obvious external hosts during build to prevent ECONNRESET noise
  if (isBuild() && /^https?:\/\//.test(url) && !url.includes('localhost')) {
    return { ok: false, skipped: true, error: 'Skipped external fetch during build phase' };
  }
  try {
    const res = await fetch(url, init as any);
    const contentType = res.headers.get('content-type') || '';
    let data: any = undefined;
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else if (contentType.startsWith('text/')) {
      data = await res.text();
    }
    return { ok: res.ok, status: res.status, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unknown fetch error' };
  }
}

// Helper for optional Mapbox / AI calls
export async function guardedExternalJson<T=any>(url: string, init?: RequestInit) {
  return guardedFetch<T>(url, { ...(init||{}), headers: { 'Accept': 'application/json', ...(init?.headers||{}) } });
}