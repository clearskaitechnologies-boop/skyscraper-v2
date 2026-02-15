// =====================================================
// /api/auth/health - Authentication Health Check
// =====================================================
// Diagnostic endpoint to verify Clerk session state server-side
// Returns auth status, user info, and request metadata
// =====================================================

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authData = await auth();
    const { userId, sessionId, orgId } = authData;

    // Check if request has cookies
    const cookieHeader = request.headers.get("cookie");
    const hasCookies = !!cookieHeader && cookieHeader.length > 0;

    // Get request metadata
    const host = request.headers.get("host") || "unknown";
    const forwardedProto = request.headers.get("x-forwarded-proto") || "unknown";
    const forwardedHost = request.headers.get("x-forwarded-host") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const response = {
      authenticated: !!userId,
      userId: userId || null,
      sessionId: sessionId || null,
      orgId: orgId || null,
      hasCookies,
      request: {
        host,
        forwardedProto,
        forwardedHost,
        userAgent: userAgent.substring(0, 100), // Truncate for safety
      },
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
        hasClerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("❌ /api/auth/health error:", error);
    return NextResponse.json(
      {
        error: "Failed to check auth health",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
