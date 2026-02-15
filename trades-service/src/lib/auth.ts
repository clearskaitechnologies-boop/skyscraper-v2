// ============================================================================
// SERVICE TOKEN AUTHENTICATION
// JWT-based authentication between SkaiScraper Core and Trades Microservice
// ============================================================================

import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const SECRET = process.env.SERVICE_TOKEN_SECRET || "dev-secret-change-in-production";

export interface ServiceTokenPayload {
  service: "skaiscrape-core";
  clerkUserId?: string;
  role?: "client" | "pro" | "admin";
  iat?: number;
  exp?: number;
}

/**
 * Verify JWT service token from Authorization header
 * Used by trades microservice to authenticate requests from Core
 */
export function verifyServiceToken(req: NextRequest): ServiceTokenPayload | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, SECRET) as ServiceTokenPayload;

    // Validate required fields
    if (payload.service !== "skaiscrape-core") {
      console.error("[Auth] Invalid service in token");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Generate JWT service token for inter-service requests
 * Used by Core to authenticate when calling trades microservice
 */
export function generateServiceToken(
  clerkUserId: string,
  role: "client" | "pro" | "admin"
): string {
  const payload: ServiceTokenPayload = {
    service: "skaiscrape-core",
    clerkUserId,
    role,
  };

  return jwt.sign(payload, SECRET, { expiresIn: "1h" });
}

/**
 * Extract Clerk User ID from verified token
 */
export function getClerkUserId(req: NextRequest): string | null {
  const payload = verifyServiceToken(req);
  return payload?.clerkUserId || null;
}

/**
 * Check if request is authenticated
 */
export function isAuthenticated(req: NextRequest): boolean {
  return verifyServiceToken(req) !== null;
}

/**
 * Middleware helper - returns 401 if not authenticated
 */
export function requireAuth(req: NextRequest) {
  const payload = verifyServiceToken(req);
  if (!payload) {
    return Response.json(
      { error: "Unauthorized - Invalid or missing service token" },
      { status: 401 }
    );
  }
  return payload;
}
