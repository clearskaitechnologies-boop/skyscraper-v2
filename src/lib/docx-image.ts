import { logger } from "@/lib/logger";

// lib/docx-image.ts
// Universal helper for embedding remote images into DOCX (works with docx v7 and v8+)

/**
 * Fetches an image from a URL and returns a Buffer ready for DOCX embedding
 * @param url - Remote image URL (supports jpg, png, webp)
 * @param width - Target width in pixels (default: 400)
 * @param height - Target height in pixels (default: 300)
 * @returns Buffer containing image data
 */
export async function fetchImageAsBuffer(
  url: string,
  width = 400,
  height = 300
): Promise<{ buffer: Buffer; width: number; height: number }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "PreLossVision/1.0", // Helps avoid some CORS issues
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return { buffer, width, height };
  } catch (error) {
    logger.error(`Error fetching image from ${url}:`, error);
    throw new Error(
      `Failed to load image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validates if an image URL is accessible
 * @param url - Image URL to validate
 * @returns true if accessible, false otherwise
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Calculates optimal dimensions while maintaining aspect ratio
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height
 * @returns Optimized dimensions
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth = 400,
  maxHeight = 300
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}
