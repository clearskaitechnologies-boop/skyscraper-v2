// Simple Firebase Storage image upload utility
import { getDownloadURL,ref, uploadBytes } from "firebase/storage";

import { storage } from "@/lib/firebase";

/**
 * Upload an image to Firebase Storage
 * @param path - Storage path (e.g., "claims/123/photo.jpg")
 * @param buffer - Image buffer
 * @returns Public download URL
 */
export async function uploadImage(path: string, buffer: Buffer): Promise<string> {
  const storageRef = ref(storage, path);
  
  const snapshot = await uploadBytes(storageRef, buffer, {
    contentType: "image/jpeg",
  });

  const url = await getDownloadURL(snapshot.ref);
  
  return url;
}
