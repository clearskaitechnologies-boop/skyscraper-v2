import { createHash, randomBytes } from "crypto";

/**
 * Generate a secure random token for invite links
 * Returns a URL-safe token (64 characters)
 */
export function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token using SHA-256
 * This is what we store in the database
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Timing-safe token comparison
 * Prevents timing attacks when comparing tokens
 */
export function compareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return expiresAt < new Date();
}
