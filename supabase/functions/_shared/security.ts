// Shared security utilities for edge functions
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// ============= Error Mapping =============
// Maps internal errors to safe user-facing messages to prevent information leakage

const ERROR_CODES = {
  AUTH_REQUIRED: { code: "E1001", message: "Authentication required", status: 401 },
  ACCESS_DENIED: { code: "E1002", message: "Access denied", status: 403 },
  NOT_FOUND: { code: "E1003", message: "Resource not found", status: 404 },
  INVALID_REQUEST: { code: "E1004", message: "Invalid request", status: 400 },
  RATE_LIMITED: {
    code: "E1005",
    message: "Too many requests, please try again later",
    status: 429,
  },
  SERVER_ERROR: { code: "E1006", message: "Internal server error", status: 500 },
} as const;

export function sanitizeError(
  error: any,
  logPrefix = "Error"
): { code: string; message: string; status: number } {
  // Log the full error server-side for debugging
  console.error(`${logPrefix}:`, {
    message: error?.message,
    name: error?.name,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  });

  // Map Supabase-specific errors
  if (error?.code === "PGRST116" || error?.message?.includes("not found")) {
    return ERROR_CODES.NOT_FOUND;
  }
  if (error?.code === "23505" || error?.message?.includes("duplicate")) {
    return ERROR_CODES.INVALID_REQUEST;
  }
  if (error?.code === "23503" || error?.message?.includes("foreign key")) {
    return ERROR_CODES.INVALID_REQUEST;
  }
  if (error?.message?.includes("JWT") || error?.message?.includes("auth")) {
    return ERROR_CODES.AUTH_REQUIRED;
  }
  if (error?.message?.includes("permission") || error?.message?.includes("policy")) {
    return ERROR_CODES.ACCESS_DENIED;
  }

  // Default to generic server error
  return ERROR_CODES.SERVER_ERROR;
}

// ============= Rate Limiting =============
// Simple in-memory rate limiter for edge functions

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export function checkRateLimit(
  userId: string,
  options: RateLimitOptions
): { allowed: boolean; resetAt?: number } {
  const key = `${options.keyPrefix || "default"}:${userId}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetAt < now) rateLimitStore.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { allowed: true };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true };
}

// ============= Input Validation Schemas =============

export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => !isNaN(Date.parse(date)), "Invalid date");

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});

// Helper to validate date range
export function validateDateRange(
  from?: string | null,
  to?: string | null
): { from: string; to: string } {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const defaultTo = now.toISOString().slice(0, 10);

  const fromDate = from ? dateParamSchema.parse(from) : defaultFrom;
  const toDate = to ? dateParamSchema.parse(to) : defaultTo;

  if (fromDate > toDate) {
    throw new Error("From date must be before to date");
  }

  return { from: fromDate, to: toDate };
}

// ============= Response Helpers =============

export function jsonResponse(data: any, status = 200, corsHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function errorResponse(
  error: ReturnType<typeof sanitizeError>,
  corsHeaders: Record<string, string> = {}
) {
  return jsonResponse({ error: error.message, code: error.code }, error.status, corsHeaders);
}
