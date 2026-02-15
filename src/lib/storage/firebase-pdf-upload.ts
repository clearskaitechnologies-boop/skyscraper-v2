// src/lib/storage/firebase-pdf-upload.ts

import { getApp,getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

import { firebaseAdmin } from "../firebaseAdmin";

function ensureFirebaseInit() {
  // Use centralized admin initialization
  if (!getApps().length) {
    throw new Error("Firebase Admin not initialized. Check firebaseAdmin.ts configuration.");
  }
  return getApp();
}

export async function uploadPDF(filePath: string, pdfBuffer: Buffer): Promise<string> {
  ensureFirebaseInit();

  const bucket = getStorage(firebaseAdmin).bucket();
  const file = bucket.file(filePath);

  await file.save(pdfBuffer, {
    contentType: "application/pdf",
    metadata: {
      contentType: "application/pdf",
    },
  });

  // Generate a signed URL valid for 10 years
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2099",
  });

  return url;
}
