/**
 * Data Encryption at Rest
 *
 * Encrypts PII fields before storing in database
 * Uses AES-256-GCM for encryption
 */

import crypto from "crypto";
import { logger } from "@/lib/logger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY || process.env.DATABASE_ENCRYPTION_KEY;

  if (!key) {
    logger.warn("⚠️ No ENCRYPTION_KEY found - using fallback (NOT FOR PRODUCTION!)");
    return "fallback-development-key-change-in-production-32bytes!!";
  }

  return key;
}

/**
 * Derive encryption key from master key + salt
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, "sha512");
}

/**
 * Encrypt a string value
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  try {
    const masterKey = getEncryptionKey();
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = deriveKey(masterKey, salt);
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Format: salt:iv:tag:encrypted
    return `${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (error) {
    logger.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) return "";

  try {
    const parts = encrypted.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const [saltHex, ivHex, tagHex, encryptedData] = parts;

    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const masterKey = getEncryptionKey();
    const key = deriveKey(masterKey, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    logger.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Encrypt an object (encrypts all string values)
 */
export function encryptObject<T extends Record<string, any>>(obj: T): T {
  const encrypted = { ...obj };

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      encrypted[key] = encrypt(value);
    } else if (typeof value === "object" && value !== null) {
      encrypted[key] = encryptObject(value);
    }
  }

  return encrypted;
}

/**
 * Decrypt an object (decrypts all string values)
 */
export function decryptObject<T extends Record<string, any>>(obj: T): T {
  const decrypted = { ...obj };

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && value.includes(":")) {
      try {
        decrypted[key] = decrypt(value);
      } catch {
        // If decryption fails, assume it's not encrypted
        decrypted[key] = value;
      }
    } else if (typeof value === "object" && value !== null) {
      decrypted[key] = decryptObject(value);
    }
  }

  return decrypted;
}

/**
 * Encrypt specific PII fields in a record
 */
export function encryptPII<T extends Record<string, any>>(record: T, piiFields: string[]): T {
  const encrypted = { ...record };

  for (const field of piiFields) {
    if (encrypted[field] && typeof encrypted[field] === "string") {
      encrypted[field] = encrypt(encrypted[field]);
    }
  }

  return encrypted;
}

/**
 * Decrypt specific PII fields in a record
 */
export function decryptPII<T extends Record<string, any>>(record: T, piiFields: string[]): T {
  const decrypted = { ...record };

  for (const field of piiFields) {
    if (decrypted[field] && typeof decrypted[field] === "string") {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch {
        // If decryption fails, keep original value
      }
    }
  }

  return decrypted;
}

/**
 * Hash sensitive data (one-way, for comparison)
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generate secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Mask PII for display (e.g., credit card numbers)
 */
export function maskPII(value: string, visibleChars: number = 4): string {
  if (!value || value.length <= visibleChars) return value;

  const masked = "*".repeat(value.length - visibleChars);
  return masked + value.slice(-visibleChars);
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 4 && parts.every((p) => /^[0-9a-f]+$/.test(p));
}

/**
 * Prisma middleware for automatic encryption
 */
export function createEncryptionMiddleware(piiFields: Record<string, string[]>) {
  return async (params: any, next: any) => {
    const model = params.model;
    const fields = piiFields[model];

    if (!fields) {
      return next(params);
    }

    // Encrypt on create/update
    if (params.action === "create" || params.action === "update") {
      if (params.args.data) {
        params.args.data = encryptPII(params.args.data, fields);
      }
    }

    const result = await next(params);

    // Decrypt on read
    if (params.action === "findUnique" || params.action === "findFirst") {
      if (result) {
        return decryptPII(result, fields);
      }
    }

    if (params.action === "findMany") {
      if (Array.isArray(result)) {
        return result.map((record: any) => decryptPII(record, fields));
      }
    }

    return result;
  };
}
