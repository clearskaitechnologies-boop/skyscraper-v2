// IMPORTANT: Use Node.js runtime for pg compatibility (not Edge)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { compose,safeAuth, withOrgScope, withRateLimit, withSentryApi } from "@/lib/api/wrappers";
import { requireUser } from "@/lib/authz";
import { pgPool } from "@/lib/db";
import { guardedExternalJson } from "@/lib/net/guardedFetch";

/**
 * POST { leadId, lat, lng }
 * Saves a Mapbox static image URL to leads.map_snapshot_url
 */
const basePOST = async (req: Request) => {
  const { userId } = await requireUser();
  const { leadId, lat, lng } = await req.json();

  if (!leadId || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Missing leadId/lat/lng" }, { status: 400 });
  }

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing MAPBOX token" }, { status: 500 });

  // Build a static image URL (Mapbox Static Images API)
  const w = 800,
    h = 500,
    z = 14;
  const base = "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static";
  const pin = `pin-l+FF0000(${lng},${lat})`;
  const url = `${base}/${pin}/${lng},${lat},${z}/${w}x${h}?access_token=${token}`;

  // Get a client from the pool
  const client = await pgPool.connect();
  
  try {
    // Persist (add org scoping in WHERE if needed)
    const result = await guardedExternalJson<any>(url);
    if (result.skipped) {
      return NextResponse.json({ ok: false, skipped: true, reason: 'build-phase-skip' }, { status: 200 });
    }
    if (!result.ok || !result.data) {
      return NextResponse.json({ error: result.error || "Snapshot failed" }, { status: 502 });
    }
    const json = result.data;

    return NextResponse.json({ ok: true, mapUrl: url });
  } catch (error: any) {
    logger.error("[API ERROR] /api/leads/map-snapshot:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save map snapshot" },
      { status: 500 }
    );
  } finally {
    // IMPORTANT: Release the client back to the pool (DO NOT call pool.end()!)
    client.release();
  }
};

// Order matters: safeAuth must wrap org scope errors. Previously withOrgScope executed before
// safeAuth, causing ORG_CONTEXT_MISSING to bubble to Sentry wrapper and return 500.
// New order: withOrgScope inside safeAuth so missing org yields 401 Unauthorized.
export const POST = compose(withSentryApi, withRateLimit, safeAuth, withOrgScope)(basePOST);
