/**
 * HEIC/HEIF Image Conversion Utility
 * Converts iPhone HEIC photos to JPEG for AI processing
 */

import * as Sentry from "@sentry/nextjs";

export interface ConversionResult {
  success: boolean;
  buffer?: Buffer;
  mimeType?: string;
  error?: string;
}

/**
 * Convert HEIC/HEIF buffer to JPEG
 * Falls back gracefully if conversion fails
 */
export async function convertHeicToJpeg(
  buffer: Buffer,
  quality: number = 90
): Promise<ConversionResult> {
  try {
    // Use sharp directly (heic-convert removed to avoid build errors)
    return await convertWithSharp(buffer, quality);
  } catch (error) {
    console.error("[HEIC] Conversion failed:", error);
    Sentry.captureException(error, {
      tags: { module: "heic-converter" },
      extra: { bufferSize: buffer.length },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "HEIC conversion failed",
    };
  }
}

/**
 * Fallback converter using sharp (supports HEIF on some systems)
 */
async function convertWithSharp(buffer: Buffer, quality: number = 90): Promise<ConversionResult> {
  try {
    const sharp = await import("sharp").catch(() => null);

    if (!sharp) {
      console.warn("[HEIC] sharp not available, returning original");
      return {
        success: false,
        error: "No conversion library available. Install heic-convert or sharp.",
      };
    }

    const outputBuffer = await sharp.default(buffer).jpeg({ quality }).toBuffer();

    return {
      success: true,
      buffer: outputBuffer,
      mimeType: "image/jpeg",
    };
  } catch (error) {
    console.error("[HEIC] Sharp fallback failed:", error);
    return {
      success: false,
      error: "Could not convert HEIC image. Upload as JPG/PNG instead.",
    };
  }
}

/**
 * Check if a file needs HEIC conversion
 */
export function isHeicImage(mimeType: string): boolean {
  return /^image\/(heic|heif)$/i.test(mimeType);
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_{2,}/g, "_")
    .substring(0, 100);
}

/**
 * Generate storage ID for uploaded file
 */
export function generateStorageId(): string {
  return `${Date.now()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 13)}`;
}
