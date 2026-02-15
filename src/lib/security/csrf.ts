/**
 * CSRF Protection
 *
 * Prevents Cross-Site Request Forgery attacks
 * Validates CSRF tokens on all mutation requests
 */

import crypto from "crypto";
import { NextRequest } from "next/server";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CSRFToken {
  token: string;
  createdAt: number;
}

// In-memory store (use Redis in production)
const csrfTokenStore = new Map<string, CSRFToken>();

// Cleanup expired tokens every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, token] of csrfTokenStore.entries()) {
      if (now - token.createdAt > CSRF_TOKEN_EXPIRY) {
        csrfTokenStore.delete(key);
      }
    }
  },
  10 * 60 * 1000
);

/**
 * Generate a CSRF token for a session
 */
export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");

  csrfTokenStore.set(sessionId, {
    token,
    createdAt: Date.now(),
  });

  return token;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokenStore.get(sessionId);

  if (!stored) {
    return false;
  }

  // Check if token expired
  if (Date.now() - stored.createdAt > CSRF_TOKEN_EXPIRY) {
    csrfTokenStore.delete(sessionId);
    return false;
  }

  // Compare tokens (constant-time comparison to prevent timing attacks)
  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}

/**
 * Get session ID from request
 */
function getSessionId(req: NextRequest): string | null {
  // Try to get from cookie
  const sessionCookie = req.cookies.get("session")?.value;
  if (sessionCookie) {
    return sessionCookie;
  }

  // Try to get from header
  const sessionHeader = req.headers.get("x-session-id");
  if (sessionHeader) {
    return sessionHeader;
  }

  return null;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFFromRequest(req: NextRequest): boolean {
  const sessionId = getSessionId(req);
  if (!sessionId) {
    return false;
  }

  // Get token from header or body
  const token = req.headers.get("x-csrf-token") || req.headers.get("csrf-token");
  if (!token) {
    return false;
  }

  return validateCSRFToken(sessionId, token);
}

/**
 * Middleware to enforce CSRF protection on mutation requests
 */
export async function enforceCSRF(req: NextRequest): Promise<void> {
  // Skip CSRF check for safe methods
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  // Validate CSRF token
  if (!validateCSRFFromRequest(req)) {
    throw new Error("Invalid or missing CSRF token");
  }
}

/**
 * CSRF middleware wrapper
 */
export function withCSRF() {
  return async (req: NextRequest) => {
    try {
      await enforceCSRF(req);
    } catch (error) {
      return new Response(JSON.stringify({ error: "CSRF validation failed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return null; // Allow request to proceed
  };
}

/**
 * Generate CSRF token endpoint helper
 */
export function getCSRFToken(req: NextRequest): { token: string } {
  const sessionId = getSessionId(req) || crypto.randomUUID();
  const token = generateCSRFToken(sessionId);

  return { token };
}
