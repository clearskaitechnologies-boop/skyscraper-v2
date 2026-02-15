/**
 * POST /api/portal/work-requests/upload
 *
 * Uploads photos for a work request after it's been created.
 * Called by SubmitWorkRequestModal when photos are attached.
 *
 * Accepts FormData with:
 *   - photos: File[] (multiple files)
 *   - requestId: string (the work request ID)
 *
 * Uploads to Vercel Blob → Supabase Storage → base64 fallback,
 * then updates the ClientWorkRequest.propertyPhotos array.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

let put:
  | ((pathname: string, body: File, options: { access: string }) => Promise<{ url: string }>)
  | null = null;
try {
  const vercelBlob = require("@vercel/blob");
  put = vercelBlob.put;
} catch {
  // Vercel Blob not available
}

function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const requestId = formData.get("requestId") as string;
    const files = formData.getAll("photos") as File[];

    if (!requestId) {
      return NextResponse.json({ error: "requestId is required" }, { status: 400 });
    }

    if (!files.length) {
      return NextResponse.json({ error: "No photos provided" }, { status: 400 });
    }

    // Verify the work request exists and belongs to this user
    const client = await prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const workRequest = await prisma.clientWorkRequest.findFirst({
      where: { id: requestId, clientId: client.id },
      select: { id: true, propertyPhotos: true },
    });

    if (!workRequest) {
      return NextResponse.json({ error: "Work request not found" }, { status: 404 });
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB per photo
    const uploadedUrls: string[] = [...(workRequest.propertyPhotos || [])];

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        console.warn(`[WR Upload] Skipping invalid file type: ${file.type}`);
        continue;
      }
      if (file.size > maxSize) {
        console.warn(`[WR Upload] Skipping oversized file: ${file.name} (${file.size} bytes)`);
        continue;
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      let url = "";

      // Strategy 1: Vercel Blob
      if (put && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(`work-requests/${requestId}/${uniqueName}`, file, {
            access: "public",
          });
          url = blob.url;
        } catch (e) {
          console.error("[WR Upload] Vercel Blob failed:", e);
        }
      }

      // Strategy 2: Supabase Storage
      if (!url && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const supabase = createSupabaseAdminClient();
          const bucket = "work-request-photos";
          const filePath = `${requestId}/${uniqueName}`;

          // Ensure bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.some((b: any) => b.name === bucket)) {
            await supabase.storage.createBucket(bucket, {
              public: true,
              fileSizeLimit: 10 * 1024 * 1024,
            });
          }

          const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

          if (!error) {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            url = urlData.publicUrl;
          }
        } catch (e) {
          console.error("[WR Upload] Supabase failed:", e);
        }
      }

      // Strategy 3: Data URL fallback (< 2MB only)
      if (!url && buffer.length < 2 * 1024 * 1024) {
        url = toDataUrl(buffer, file.type);
      }

      if (url) {
        uploadedUrls.push(url);
      }
    }

    // Update the work request with new photo URLs
    await prisma.clientWorkRequest.update({
      where: { id: requestId },
      data: {
        propertyPhotos: uploadedUrls,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedUrls.length - (workRequest.propertyPhotos || []).length,
      totalPhotos: uploadedUrls.length,
    });
  } catch (error) {
    console.error("[WR Upload] Error:", error);
    return NextResponse.json({ error: "Failed to upload photos" }, { status: 500 });
  }
}
