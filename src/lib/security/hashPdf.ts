/**
 * Document Security Utilities
 * PDF checksum generation and tamper detection
 */

import crypto from "crypto";

/**
 * Generate SHA-256 hash of PDF buffer
 * Used for tamper detection and signature verification
 */
export function hashPdf(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Verify PDF hasn't been tampered with
 */
export function verifyPdfChecksum(buffer: Buffer, expectedChecksum: string): boolean {
  const actualChecksum = hashPdf(buffer);
  return actualChecksum === expectedChecksum;
}

/**
 * Generate document verification code
 * Short code for quick verification (e.g., "ABC-123-XYZ")
 */
export function generateVerificationCode(documentId: string): string {
  const hash = crypto.createHash("md5").update(documentId).digest("hex");
  const parts = [hash.substring(0, 3), hash.substring(3, 6), hash.substring(6, 9)];
  return parts.join("-").toUpperCase();
}
