import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/_debug/portal-health
 * Diagnostics endpoint to check portal routing and auth health
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    const portalRoutes = ["/client", "/client/claim/[claimId]", "/client/[slug]/profile"];

    const health = {
      ok: true,
      timestamp: new Date().toISOString(),
      auth: {
        userId: userId || null,
        hasSession: !!userId,
      },
      portal: {
        routesFound: portalRoutes,
        baseRoute: "/client",
      },
      reason: userId
        ? "Portal accessible with auth"
        : "Portal accessible without auth (public check)",
    };

    return NextResponse.json(health);
  } catch (error: any) {
    console.error("[GET /api/_debug/portal-health] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Portal health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
