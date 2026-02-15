// ============================================================================
// FIREBASE STORAGE CLIENT
// Shared storage with SkaiScraper Core for portfolio uploads
// ============================================================================

import { cert,getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const storage = getStorage();

/**
 * Upload file to Firebase Storage
 * Returns public URL
 */
export async function uploadToFirebase(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const bucket = storage.bucket();
  const file = bucket.file(path);

  await file.save(buffer, {
    contentType,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFromFirebase(path: string): Promise<void> {
  const bucket = storage.bucket();
  await bucket.file(path).delete();
}

/**
 * Generate unique filename for uploads
 */
export function generateUploadPath(
  clerkUserId: string,
  originalName: string,
  category: "portfolio" | "cert" | "profile"
): string {
  const timestamp = Date.now();
  const ext = originalName.split(".").pop();
  const sanitized = originalName.replace(/[^a-z0-9.]/gi, "_");
  return `trades/${category}/${clerkUserId}/${timestamp}_${sanitized}`;
}
