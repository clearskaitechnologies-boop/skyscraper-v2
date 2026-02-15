// ============================================================================
// GET /api/health - Health check endpoint
// ============================================================================

import { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { errorResponse,successResponse } from "@/lib/responses";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return successResponse(
      {
        status: "healthy",
        service: "trades-microservice",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      200
    );
  } catch (error) {
    console.error("[Health Check] Database error:", error);
    return errorResponse("Service unhealthy - database connection failed", 503);
  }
}
