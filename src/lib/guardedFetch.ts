import { logger } from "@/lib/logger";

export async function guardedFetch(url: string, options: any = {}, label = "external") {
  if (!url) {
    logger.warn(`⚠ guardedFetch called with empty URL [${label}]`);
    return null;
  }

  try {
    const res = await fetch(url, { ...options, cache: "no-store" });

    if (!res.ok) {
      logger.warn(`⚠ ${label} → HTTP ${res.status}`);
      return null;
    }

    return res;
  } catch (err: any) {
    logger.warn(`❌ ${label} fetch failed:`, err?.message || err);
    return null;
  }
}
