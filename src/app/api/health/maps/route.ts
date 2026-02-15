import { NextResponse } from "next/server";

/**
 * GET /api/health/maps
 * Mapbox configuration check - returns boolean presence only (never exposes tokens)
 */
export async function GET() {
  const publicToken = !!(
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  );

  // Many server-side Mapbox calls can safely use the same token as the client.
  // We still report whether MAPBOX_ACCESS_TOKEN is explicitly configured.
  const serverTokenEnv = !!process.env.MAPBOX_ACCESS_TOKEN;
  const serverTokenEffective = !!(
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  );

  // Optional live verification (status only). Avoid exposing tokens in logs or responses.
  let mapboxPing: { ok: boolean; status?: number; error?: string } | null = null;
  const tokenForPing =
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (tokenForPing) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${encodeURIComponent(tokenForPing)}`;
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      mapboxPing = { ok: res.ok, status: res.status };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      mapboxPing = { ok: false, error: msg };
    }
  }

  return NextResponse.json({
    ok: publicToken && serverTokenEffective,
    NEXT_PUBLIC_MAPBOX_TOKEN: publicToken,
    MAPBOX_ACCESS_TOKEN: serverTokenEnv,
    serverTokenEffective,
    mapboxPing,
    ts: new Date().toISOString(),
  });
}
