import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/_headers
 * Returns request headers to debug domain/routing issues
 */
export async function GET() {
  const headersList = headers();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    headers: {
      host: headersList.get("host"),
      "x-forwarded-host": headersList.get("x-forwarded-host"),
      "x-forwarded-proto": headersList.get("x-forwarded-proto"),
      "x-vercel-id": headersList.get("x-vercel-id"),
      "x-vercel-deployment-url": headersList.get("x-vercel-deployment-url"),
      referer: headersList.get("referer"),
      "user-agent": headersList.get("user-agent")?.substring(0, 100),
    },
  });
}
