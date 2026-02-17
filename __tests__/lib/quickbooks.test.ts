/**
 * Tests for QuickBooks integration + token encryption
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  encryptToken,
  decryptToken,
  isEncrypted,
  safeDecrypt,
  ensureEncrypted,
} from "@/lib/crypto/token-encryption";

describe("Token Encryption", () => {
  const originalEnv = process.env.TOKEN_ENCRYPTION_KEY;

  beforeEach(() => {
    // Use test encryption key
    process.env.TOKEN_ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  });

  afterEach(() => {
    process.env.TOKEN_ENCRYPTION_KEY = originalEnv;
  });

  it("encrypts and decrypts a token correctly", () => {
    const plaintext = "ya29.a0AfH6SMBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    const encrypted = encryptToken(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.length).toBeGreaterThan(40);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext for same input (random IV)", () => {
    const plaintext = "test-token-123";
    const encrypted1 = encryptToken(plaintext);
    const encrypted2 = encryptToken(plaintext);

    expect(encrypted1).not.toBe(encrypted2);

    // Both should decrypt to same value
    expect(decryptToken(encrypted1)).toBe(plaintext);
    expect(decryptToken(encrypted2)).toBe(plaintext);
  });

  it("detects encrypted vs plaintext strings", () => {
    const plaintext = "short_token";
    const encrypted = encryptToken(plaintext);

    expect(isEncrypted(plaintext)).toBe(false);
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it("safeDecrypt handles both encrypted and plaintext", () => {
    const plaintext = "legacy-plaintext-token";
    const encrypted = encryptToken("new-encrypted-token");

    // Plaintext passes through
    expect(safeDecrypt(plaintext)).toBe(plaintext);

    // Encrypted gets decrypted
    expect(safeDecrypt(encrypted)).toBe("new-encrypted-token");
  });

  it("ensureEncrypted encrypts only if needed", () => {
    const plaintext = "my-token";
    const alreadyEncrypted = encryptToken("my-token");

    // Plaintext gets encrypted
    const result1 = ensureEncrypted(plaintext);
    expect(result1).not.toBe(plaintext);
    expect(decryptToken(result1)).toBe(plaintext);

    // Already encrypted stays the same (roughly - may re-encrypt with same result)
    const result2 = ensureEncrypted(alreadyEncrypted);
    // Should still decrypt to same value
    expect(decryptToken(result2)).toBe("my-token");
  });

  it("handles special characters in tokens", () => {
    const tokenWithSpecials =
      'token/with+special=chars&more!@#$%^&*(){}[]|\\:";\'<>?,./';
    const encrypted = encryptToken(tokenWithSpecials);
    const decrypted = decryptToken(encrypted);

    expect(decrypted).toBe(tokenWithSpecials);
  });

  it("handles long tokens", () => {
    const longToken = "x".repeat(10000);
    const encrypted = encryptToken(longToken);
    const decrypted = decryptToken(encrypted);

    expect(decrypted).toBe(longToken);
  });
});

describe("QuickBooks OAuth Flow", () => {
  it("generates valid authorization URL", async () => {
    // Mock environment
    vi.stubEnv("QUICKBOOKS_CLIENT_ID", "test-client-id");
    vi.stubEnv("QUICKBOOKS_REDIRECT_URI", "https://example.com/callback");

    const { getAuthorizationUrl } = await import(
      "@/lib/integrations/quickbooks"
    );
    const url = getAuthorizationUrl("org-123");

    expect(url).toContain("appcenter.intuit.com");
    expect(url).toContain("client_id=");
    expect(url).toContain("state=org-123");
    expect(url).toContain("scope=com.intuit.quickbooks.accounting");

    vi.unstubAllEnvs();
  });
});
