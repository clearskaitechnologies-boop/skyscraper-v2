// IMPORTANT: Use Node.js runtime for Clerk compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk Health Check
 * GET /api/diag/clerk
 *
 * Verifies Clerk configuration and shows whether using test or production keys.
 * Use this to confirm production deployment is using live keys.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!publishableKey || !secretKey) {
      return NextResponse.json(
        {
          status: "error",
          error: "Clerk keys not configured",
          missing: {
            publishableKey: !publishableKey,
            secretKey: !secretKey,
          },
        },
        { status: 500 }
      );
    }

    // Determine key type (test vs live)
    const isLivePublishable = publishableKey.startsWith("pk_live_");
    const isLiveSecret = secretKey.startsWith("sk_live_");

    // Extract domain from publishable key (base64 encoded)
    let domain = "unknown";
    try {
      const keyParts = publishableKey.split("_");
      if (keyParts.length >= 3) {
        const encoded = keyParts[2];
        domain = Buffer.from(encoded, "base64").toString("utf-8");
      }
    } catch (e) {
      // Ignore decode errors
    }

    return NextResponse.json({
      status: "ok",
      clerk: {
        publishableKeyType: isLivePublishable ? "LIVE" : "TEST",
        secretKeyType: isLiveSecret ? "LIVE" : "TEST",
        domain: domain,
        publishableKeyPrefix: publishableKey.substring(0, 15) + "...",
        secretKeyPrefix: secretKey.substring(0, 15) + "...",
        allLive: isLivePublishable && isLiveSecret,
      },
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL === "1",
    });
  } catch (error: any) {
    console.error("[CLERK HEALTH CHECK ERROR]:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        details: "Failed to check Clerk configuration",
      },
      { status: 500 }
    );
  }
}
