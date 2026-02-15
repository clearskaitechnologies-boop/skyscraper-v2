export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";

// Simple endpoint to test rate limiting - no auth required
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "ok",
    description: "Rate limit test endpoint",
    timestamp: new Date().toISOString(),
  });
}
