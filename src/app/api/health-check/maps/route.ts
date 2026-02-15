import { NextResponse } from "next/server";

/**
 * GET /api/_health/maps
 * Mapbox token health check - returns presence only, never the actual token
 */
export async function GET() {
  const publicToken = !!(
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  );

  const serverTokenEnv = !!process.env.MAPBOX_ACCESS_TOKEN;
  const serverTokenEffective = !!(
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  );

  return NextResponse.json({
    status: publicToken || serverTokenEffective ? "ok" : "warning",
    timestamp: new Date().toISOString(),
    tokens: {
      NEXT_PUBLIC_MAPBOX_TOKEN: publicToken,
      MAPBOX_ACCESS_TOKEN: serverTokenEnv,
    },
    serverTokenEffective,
    message:
      publicToken && serverTokenEffective
        ? "Both tokens configured"
        : !publicToken && !serverTokenEnv
          ? "No Mapbox tokens configured"
          : "Partial Mapbox configuration",
  });
}
