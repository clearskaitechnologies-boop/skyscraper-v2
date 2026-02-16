/**
 * Central API Error Handling
 *
 * Provides standardized error responses across all API routes.
 *
 * Usage:
 * ```typescript
 * import { ApiError, handleApiError } from '@/lib/api/errors';
 *
 * // Throw structured errors
 * throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
 *
 * // Or handle errors in catch blocks
 * try {
 *   // ... your logic
 * } catch (error) {
 *   return handleApiError(error);
 * }
 * ```
 */

import { ClerkAPIError } from "@clerk/nextjs/errors";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * Standard API Error Class
 * Extends Error with HTTP status code and error code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Common API Error Codes
 * Use these constants for consistency across the codebase
 */
export const ErrorCodes = {
  // 400 Bad Request
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",

  // 401 Unauthorized
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // 403 Forbidden
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // 404 Not Found
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // 409 Conflict
  ALREADY_EXISTS: "ALREADY_EXISTS",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",

  // 429 Rate Limit
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",

  // 500 Internal Server Error
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // 501 Not Implemented
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",

  // 503 Service Unavailable
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  MAINTENANCE_MODE: "MAINTENANCE_MODE",
} as const;

/**
 * Standard API Error Response Shape
 */
export interface ApiErrorResponse {
  ok: false;
  error: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Standard API Success Response Shape
 */
export interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
  message?: string;
}

/**
 * Convert any error into a standardized API error response
 *
 * Handles:
 * - ApiError (custom errors)
 * - Prisma errors (database)
 * - Clerk errors (authentication)
 * - Standard JavaScript errors
 * - Unknown errors
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  logger.error("[API Error]", error);

  // Handle our custom ApiError
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma database errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  // Handle Clerk authentication errors
  if (error instanceof ClerkAPIError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Authentication error",
        code: ErrorCodes.UNAUTHORIZED,
        statusCode: 401,
        details: { clerkError: error.message },
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    );
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "An unexpected error occurred",
        code: ErrorCodes.INTERNAL_ERROR,
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      ok: false,
      error: "An unexpected error occurred",
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
      details: { rawError: String(error) },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors with appropriate HTTP status codes
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse<ApiErrorResponse> {
  let message = "Database error";
  let code = ErrorCodes.DATABASE_ERROR;
  let statusCode = 500;

  // P2002: Unique constraint violation
  if (error.code === "P2002") {
    message = "A record with this value already exists";
    code = ErrorCodes.DUPLICATE_ENTRY;
    statusCode = 409;
  }

  // P2025: Record not found
  if (error.code === "P2025") {
    message = "Record not found";
    code = ErrorCodes.NOT_FOUND;
    statusCode = 404;
  }

  // P2003: Foreign key constraint violation
  if (error.code === "P2003") {
    message = "Referenced record does not exist";
    code = ErrorCodes.INVALID_INPUT;
    statusCode = 400;
  }

  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
      statusCode,
      details: {
        prismaCode: error.code,
        meta: error.meta,
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Create a success response with standardized shape
 *
 * Usage:
 * ```typescript
 * return successResponse({ userId: '123', name: 'John' }, 'User created successfully');
 * ```
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      ok: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Common error factories for frequent use cases
 */
export const Errors = {
  unauthorized: (message = "Unauthorized") => new ApiError(message, 401, ErrorCodes.UNAUTHORIZED),

  forbidden: (message = "Forbidden") => new ApiError(message, 403, ErrorCodes.FORBIDDEN),

  notFound: (resource = "Resource", id?: string) =>
    new ApiError(
      id ? `${resource} with ID '${id}' not found` : `${resource} not found`,
      404,
      ErrorCodes.NOT_FOUND
    ),

  invalidInput: (message: string, details?: Record<string, unknown>) =>
    new ApiError(message, 400, ErrorCodes.INVALID_INPUT, details),

  missingField: (field: string) =>
    new ApiError(`Missing required field: ${field}`, 400, ErrorCodes.MISSING_FIELD, { field }),

  alreadyExists: (resource: string) =>
    new ApiError(`${resource} already exists`, 409, ErrorCodes.ALREADY_EXISTS),

  notImplemented: (feature = "This feature") =>
    new ApiError(`${feature} is not yet implemented`, 501, ErrorCodes.NOT_IMPLEMENTED),

  rateLimit: (message = "Rate limit exceeded") =>
    new ApiError(message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED),

  serviceUnavailable: (message = "Service temporarily unavailable") =>
    new ApiError(message, 503, ErrorCodes.SERVICE_UNAVAILABLE),
};

/**
 * Validation helper: throw if condition is false
 *
 * Usage:
 * ```typescript
 * validate(userId, Errors.unauthorized('User ID required'));
 * validate(claim.orgId === user.orgId, Errors.forbidden('Cannot access this claim'));
 * ```
 */
export function validate(condition: unknown, error: ApiError): asserts condition {
  if (!condition) {
    throw error;
  }
}

/**
 * Require field: throw if undefined/null/empty
 *
 * Usage:
 * ```typescript
 * const claimId = requireField(body.claimId, 'claimId');
 * ```
 */
export function requireField<T>(value: T | undefined | null, fieldName: string): T {
  if (value === undefined || value === null || value === "") {
    throw Errors.missingField(fieldName);
  }
  return value;
}
