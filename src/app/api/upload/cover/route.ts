import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Use service role key for reliable server-side uploads (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for cover photos
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
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = crypto.randomUUID().replace(/-/g, "").slice(0, 13);
    const ext = file.name.split(".").pop();
    const filename = `covers/${userId}/${timestamp}-${randomStr}.${ext}`;

    // Try Supabase first if configured
    if (supabase) {
      // First, try to ensure the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === "profile-photos");

      if (!bucketExists) {
        // Try to create the bucket
        const { error: createError } = await supabase.storage.createBucket("profile-photos", {
          public: true,
          fileSizeLimit: 10 * 1024 * 1024, // 10MB
        });
        if (createError && !createError.message.includes("already exists")) {
          console.error("[Cover Upload] Failed to create bucket:", createError);
        }
      }

      const { data, error } = await supabase.storage
        .from("profile-photos")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(data.path);
        return NextResponse.json({ url: publicUrl, storage: "supabase" });
      }

      logger.error("[Cover Upload] Supabase error:", error);
    }

    // Firebase fallback
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
        logger.debug("[Cover Upload] Firebase success:", { firebasePath, downloadUrl });
        return NextResponse.json({ url: downloadUrl, storage: "firebase" });
      }
    } catch (firebaseError) {
      console.error("[Cover Upload] Firebase fallback failed:", firebaseError);
    }

    return NextResponse.json(
      {
        error: "Failed to upload file - storage not configured",
        hasSupabase: !!supabase,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
      },
      { status: 500 }
    );
  } catch (error: any) {
    logger.error("Cover upload error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
