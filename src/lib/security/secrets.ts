/**
 * Secret Management
 *
 * Validates environment variables and provides secure access to secrets
 * Prevents accidental exposure of sensitive data
 */

import crypto from "crypto";

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = ["DATABASE_URL", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"];

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  "ENCRYPTION_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
  "VERCEL_URL",
];

/**
 * Validate environment variables
 */
export function validateEnvironment(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check recommended variables
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get secret with fallback
 */
export function getSecret(key: string, fallback?: string): string {
  const value = process.env[key];

  if (!value) {
    if (fallback) {
      console.warn(`⚠️ Using fallback for ${key}`);
      return fallback;
    }
    throw new Error(`Missing required secret: ${key}`);
  }

  return value;
}

/**
 * Get optional secret
 */
export function getOptionalSecret(key: string): string | undefined {
  return process.env[key];
}

/**
 * Mask secret for logging
 */
export function maskSecret(secret: string, visibleChars: number = 4): string {
  if (!secret || secret.length <= visibleChars) {
    return "***";
  }

  return `${secret.substring(0, visibleChars)}${"*".repeat(secret.length - visibleChars * 2)}${secret.substring(secret.length - visibleChars)}`;
}

/**
 * Validate secret format
 */
export function validateSecretFormat(secret: string, pattern: RegExp): boolean {
  return pattern.test(secret);
}

/**
 * Generate secure random secret
 */
export function generateSecret(length: number = 32): string {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
}

/**
 * Hash secret for storage (one-way)
 */
export function hashSecret(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/**
 * Compare secret with hash
 */
export function verifySecret(secret: string, hash: string): boolean {
  return hashSecret(secret) === hash;
}

/**
 * API key management
 */
export interface APIKey {
  id: string;
  name: string;
  keyHash: string;
  lastUsed?: Date;
  expiresAt?: Date;
  permissions: string[];
}

/**
 * Generate API key
 */
export function generateAPIKey(prefix: string = "sk"): { key: string; hash: string } {
  const random = crypto.randomBytes(32).toString("hex");
  const key = `${prefix}_${random}`;
  const hash = hashSecret(key);

  return { key, hash };
}

/**
 * Validate API key format
 */
export function validateAPIKeyFormat(key: string): boolean {
  return /^[a-z]{2}_[a-zA-Z0-9]{64}$/.test(key);
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get all secrets (for audit/debugging - NEVER expose to client)
 */
export function auditSecrets(): Record<string, string> {
  const secrets: Record<string, string> = {};

  const secretKeys = [...REQUIRED_ENV_VARS, ...RECOMMENDED_ENV_VARS];

  for (const key of secretKeys) {
    const value = process.env[key];
    secrets[key] = value ? maskSecret(value) : "NOT SET";
  }

  return secrets;
}

/**
 * Rotate API key
 */
export function rotateAPIKey(oldKey: string): { newKey: string; hash: string } {
  // Verify old key format
  if (!validateAPIKeyFormat(oldKey)) {
    throw new Error("Invalid API key format");
  }

  // Generate new key with same prefix
  const prefix = oldKey.split("_")[0];
  return generateAPIKey(prefix);
}

/**
 * Check if secret is expired
 */
export function isSecretExpired(expiresAt?: Date): boolean {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  databaseUrl: string;
  clerkPublishableKey: string;
  clerkSecretKey: string;
  encryptionKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  openaiApiKey?: string;
  sentryDsn?: string;
}

/**
 * Get validated environment config
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const validation = validateEnvironment();

  if (!validation.valid) {
    throw new Error(`Missing required environment variables: ${validation.missing.join(", ")}`);
  }

  if (validation.warnings.length > 0 && isProduction()) {
    console.warn(`⚠️ Missing recommended environment variables: ${validation.warnings.join(", ")}`);
  }

  return {
    databaseUrl: getSecret("DATABASE_URL"),
    clerkPublishableKey: getSecret("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    clerkSecretKey: getSecret("CLERK_SECRET_KEY"),
    encryptionKey: getOptionalSecret("ENCRYPTION_KEY"),
    stripeSecretKey: getOptionalSecret("STRIPE_SECRET_KEY"),
    stripeWebhookSecret: getOptionalSecret("STRIPE_WEBHOOK_SECRET"),
    openaiApiKey: getOptionalSecret("OPENAI_API_KEY"),
    sentryDsn: getOptionalSecret("SENTRY_DSN"),
  };
}
