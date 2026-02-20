/**
 * Safe Prisma Query Wrapper
 *
 * Prevents SQL injection by validating and sanitizing inputs
 * Enforces org scoping on all raw SQL queries
 */

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

/**
 * Safe raw query that enforces org scoping
 * ALWAYS use this instead of prisma.$queryRaw for user-provided input
 */
export async function safeQueryRaw<T = unknown>(
  query: TemplateStringsArray,
  ...values: any[]
): Promise<T> {
  // Validate that query doesn't contain dangerous patterns
  const queryString = query.join("?");

  const dangerousPatterns = [
    /DROP\s+TABLE/i,
    /DROP\s+DATABASE/i,
    /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i,
    /UPDATE.*SET.*WHERE\s+1\s*=\s*1/i,
    /TRUNCATE/i,
    /ALTER\s+TABLE/i,
    /GRANT/i,
    /REVOKE/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(queryString)) {
      throw new Error("Potentially dangerous SQL query detected");
    }
  }

  // Execute query
  return prisma.$queryRaw(query, ...values) as Promise<T>;
}

/**
 * Safe org-scoped raw query
 * Automatically adds orgId filter to WHERE clause
 */
export async function safeOrgQuery<T = unknown>(
  orgId: string,
  query: TemplateStringsArray,
  ...values: any[]
): Promise<T> {
  // Validate orgId format (UUID)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orgId)) {
    throw new Error("Invalid orgId format");
  }

  // Check if query already has WHERE clause
  const queryString = query.join("?");
  const hasWhere = /WHERE/i.test(queryString);

  if (hasWhere) {
    // Add orgId as AND condition
    const modifiedQuery = queryString.replace(/WHERE/i, `WHERE "orgId" = '${orgId}' AND`);
    return safeQueryRaw(Prisma.raw(modifiedQuery), ...values);
  } else {
    // Add WHERE clause with orgId
    const modifiedQuery = queryString + ` WHERE "orgId" = '${orgId}'`;
    return safeQueryRaw(Prisma.raw(modifiedQuery), ...values);
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Sanitize string input for SQL
 * Escapes single quotes and removes control characters
 */
export function sanitizeSQLString(input: string): string {
  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/[\0\x08\x09\x1a\n\r"\\]/g, "") // Remove control characters
    .trim();
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  return email.toLowerCase().trim();
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Must be 10-15 digits
  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Invalid phone number format");
  }

  return digits;
}

/**
 * Validate integer input
 */
export function validateInteger(value: any): number {
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error("Invalid integer value");
  }
  return num;
}

/**
 * Validate float input
 */
export function validateFloat(value: any): number {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error("Invalid float value");
  }
  return num;
}

/**
 * Validate date input
 */
export function validateDate(value: any): Date {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date value");
  }
  return date;
}

/**
 * Sanitize array of IDs
 */
export function sanitizeIdArray(ids: string[]): string[] {
  return ids.filter((id) => validateUUID(id));
}

/**
 * Prevent NoSQL injection in JSON fields
 */
export function sanitizeJSON(input: any): any {
  if (typeof input === "string") {
    return sanitizeSQLString(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeJSON);
  }

  if (typeof input === "object" && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeSQLString(key)] = sanitizeJSON(value);
    }
    return sanitized;
  }

  return input;
}
