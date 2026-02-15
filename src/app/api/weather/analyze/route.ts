export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Weather Analyze API
 *
 * POST /api/weather/analyze
 * Enqueues a weather analysis job for the specified location and date range.
 *
 * Request:
 * {
 *   "lat": 34.54,
 *   "lng": -112.47,
 *   "dateFrom": "2024-01-01", // optional
 *   "dateTo": "2024-01-31",   // optional
 *   "orgId": "...",           // optional
 *   "userId": "..."           // optional
 * }
 *
 * Response:
 * {
 *   "jobId": "..."
 * }
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { enqueue } from "@/lib/queue";
import { getRateLimitIdentifier, rateLimiters } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limiting check (30 requests per minute for weather endpoints)
    const { userId } = await auth();
    const identifier = getRateLimitIdentifier(userId, req);
    const allowed = await rateLimiters.weather.check(30, identifier);

    if (!allowed) {
      console.log("[WEATHER] ⚠️  Rate limit exceeded for:", identifier);
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { lat, lng, dateFrom, dateTo, orgId, userId: bodyUserId } = body;

    // Validate required fields
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Missing required fields: lat, lng" }, { status: 400 });
    }

    // Enqueue weather analysis job
    const jobId = await enqueue("weather-analyze" as any, [
      {
        lat,
        lng,
        dateFrom,
        dateTo,
        orgId,
        userId: bodyUserId,
      },
    ]);

    console.log(`Weather analysis job enqueued: ${jobId}`);

    return NextResponse.json({
      jobId,
    });
  } catch (error: any) {
    console.error("Error enqueuing weather analysis job:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
