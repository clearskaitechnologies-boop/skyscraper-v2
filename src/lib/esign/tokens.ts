/**
 * Secure Token Utilities for E-Signature Links
 *
 * Generate and validate tokens for email signature requests
 * Tokens are hashed before storage - never store raw tokens
 */

import { createHash, randomBytes } from "crypto";

export interface TokenPair {
  raw: string; // Send this in email
  hash: string; // Store this in database
}

/**
 * Generate a cryptographically secure token
 * Returns both raw token (for sending) and hash (for storage)
 */
export function generateToken(): TokenPair {
  const raw = randomBytes(32).toString("hex"); // 64 character hex string
  const hash = hashToken(raw);

  return { raw, hash };
}

/**
 * Hash a token using SHA-256
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Verify a token against a stored hash
 */
export function verifyToken(token: string, storedHash: string): boolean {
  const tokenHash = hashToken(token);
  return tokenHash === storedHash;
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Generate token expiration date (default 7 days)
 */
export function getTokenExpiration(daysFromNow = 7): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysFromNow);
  return expiry;
}
