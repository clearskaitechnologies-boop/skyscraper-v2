/**
 * Headshot Upload API - Alias for /api/upload/avatar
 * Used by team member profile edit pages
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = crypto.randomUUID().replace(/-/g, "").slice(0, 13);
    const ext = file.name.split(".").pop();
    const filename = `headshots/${userId}/${timestamp}-${randomStr}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("profile-photos").upload(filename, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      console.error("Supabase upload error, trying Firebase:", error);

      // Try Firebase fallback
      try {
        const { getFirebaseStorage } = await import("@/lib/firebase");
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");

        const firebaseStorage = getFirebaseStorage();
        if (firebaseStorage) {
          const firebasePath = `profile-photos/${filename}`;
          const storageRef = ref(firebaseStorage, firebasePath);
          const uint8Array = new Uint8Array(buffer);

          await uploadBytes(storageRef, uint8Array, {
            contentType: file.type,
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              userId: userId || "",
            },
          });

          const downloadUrl = await getDownloadURL(storageRef);
          console.log("[Headshot Upload] Firebase success:", { firebasePath, downloadUrl });

          return NextResponse.json({ url: downloadUrl, storage: "firebase" });
        }
      } catch (firebaseError) {
        console.error("[Headshot Upload] Firebase fallback failed:", firebaseError);
      }

      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL from Supabase
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(data.path);

    return NextResponse.json({ url: publicUrl, storage: "supabase" });
  } catch (error) {
    console.error("Headshot upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
