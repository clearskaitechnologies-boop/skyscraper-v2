import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// Try to use Vercel Blob if available, otherwise use Supabase
let put:
  | ((pathname: string, body: File, options: { access: string }) => Promise<{ url: string }>)
  | null = null;
try {
  const vercelBlob = require("@vercel/blob");
  put = vercelBlob.put;
} catch {
  // Vercel Blob not available or not configured
}

// Fallback: Convert image to base64 data URL for storage
function toDataUrl(file: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${file.toString("base64")}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "avatar", "cover", or "property"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!["avatar", "cover", "property"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid upload type. Must be 'avatar', 'cover', or 'property'" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, GIF, WebP, or HEIC image." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    let uploadUrl: string;
    const fileExt = file.name.split(".").pop() || "jpg";
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Strategy 1: Try Vercel Blob (production preferred)
    if (put && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const filename = `client-${type}/${userId}/${uniqueFilename}`;
        const blob = await put(filename, file, { access: "public" });
        uploadUrl = blob.url;
        console.log(`[Upload] ✅ Vercel Blob upload successful: ${uploadUrl}`);
      } catch (blobError) {
        console.error("[Upload] Vercel Blob failed:", blobError);
        // Fall through to try other methods
        uploadUrl = "";
      }
    } else {
      uploadUrl = "";
    }

    // Strategy 2: Try Supabase Storage
    if (!uploadUrl && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createSupabaseAdminClient();
        const bucket = "profile-photos";
        const folder = type === "avatar" ? "avatars" : type === "cover" ? "covers" : "properties";
        const filePath = `${folder}/${userId}/${uniqueFilename}`;

        // Ensure the bucket exists (create if missing)
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some((b: any) => b.name === bucket);
        if (!bucketExists) {
          const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024,
            allowedMimeTypes: [...validTypes, "image/heic", "image/heif"],
          });
          if (createError) {
            console.error("[Upload] Bucket creation failed:", createError.message);
          } else {
            console.log("[Upload] ✅ Created bucket:", bucket);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("[Upload] Supabase Storage failed:", uploadError);
        } else {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          uploadUrl = urlData.publicUrl;
          console.log(`[Upload] ✅ Supabase Storage upload successful: ${uploadUrl}`);
        }
      } catch (supaError) {
        console.error("[Upload] Supabase error:", supaError);
      }
    }

    // Strategy 3: Use data URL (last resort - stores in database)
    if (!uploadUrl) {
      console.log(
        "[Upload] ⚠️ Both Vercel Blob and Supabase Storage unavailable, using data URL fallback"
      );
      // For images under 2MB, we can store as data URL in the database
      if (buffer.length < 2 * 1024 * 1024) {
        uploadUrl = toDataUrl(buffer, file.type);
        console.log(`[Upload] ✅ Data URL created (${Math.round(buffer.length / 1024)}KB)`);
      } else {
        return NextResponse.json(
          {
            error:
              "Storage services unavailable and image is too large for fallback. Please try a smaller image (under 2MB) or try again later.",
          },
          { status: 503 }
        );
      }
    }

    // Build update data based on type
    const updateData =
      type === "avatar"
        ? { avatarUrl: uploadUrl }
        : type === "cover"
          ? { coverPhotoUrl: uploadUrl }
          : { propertyPhotoUrl: uploadUrl };

    // Use upsert to create client if it doesn't exist
    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const slug = `client-${userId.slice(-8)}`;

    const client = await prisma.client.upsert({
      where: { userId },
      update: updateData,
      create: {
        id: crypto.randomUUID(),
        userId,
        slug,
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || email.split("@")[0],
        ...updateData,
      },
    });

    return NextResponse.json({
      success: true,
      url: uploadUrl,
      type,
      client,
    });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
