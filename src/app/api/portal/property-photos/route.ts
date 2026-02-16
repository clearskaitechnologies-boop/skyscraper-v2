// ORG-SCOPE: Scoped by userId/clientId — all queries filter by client.id (derived from auth userId). No cross-tenant risk.
/**
 * Client Property Photos API
 * Supports multi-photo uploads organized into folders:
 *   - property  (main property photos)
 *   - damage    (damage documentation)
 *   - before    (pre-loss / before photos)
 *   - after     (post-repair / after photos)
 *   - documents (receipts, invoices, etc.)
 *
 * GET  → list all photos (optionally filtered by ?folder=)
 * POST → upload a new photo to a folder
 * DELETE → remove a photo by id (?id=xxx)
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// Try Vercel Blob first
let blobPut:
  | ((pathname: string, body: File, options: { access: string }) => Promise<{ url: string }>)
  | null = null;
try {
  const vercelBlob = require("@vercel/blob");
  blobPut = vercelBlob.put;
} catch {
  // Vercel Blob not available
}

const VALID_FOLDERS = ["property", "damage", "before", "after", "documents"] as const;
type PhotoFolder = (typeof VALID_FOLDERS)[number];

const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB per photo
const MAX_PHOTOS_PER_FOLDER = 25;

// ─── GET: List photos ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folder = request.nextUrl.searchParams.get("folder") as PhotoFolder | null;

    const client = await prisma.client.findUnique({ where: { userId }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ photos: [], folders: {} });
    }

    const where: any = { clientId: client.id };
    if (folder && VALID_FOLDERS.includes(folder)) {
      where.folder = folder;
    }

    const photos = await prisma.clientPropertyPhoto.findMany({
      where,
      orderBy: [{ folder: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });

    // Group by folder for easy UI consumption
    const folders: Record<string, typeof photos> = {};
    for (const photo of photos) {
      if (!folders[photo.folder]) folders[photo.folder] = [];
      folders[photo.folder].push(photo);
    }

    return NextResponse.json({ photos, folders });
  } catch (error) {
    console.error("[Property Photos] GET error:", error);
    return NextResponse.json({ error: "Failed to load photos" }, { status: 500 });
  }
}

// ─── POST: Upload photo ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "property";
    const caption = (formData.get("caption") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!VALID_FOLDERS.includes(folder as PhotoFolder)) {
      return NextResponse.json(
        { error: `Invalid folder. Must be one of: ${VALID_FOLDERS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPEG, PNG, GIF, WebP, or HEIC." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
    }

    // Get or create client record
    const email = user.emailAddresses?.[0]?.emailAddress || "";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const slug = `client-${userId.slice(-8)}`;

    const client = await prisma.client.upsert({
      where: { userId },
      update: {},
      create: {
        id: crypto.randomUUID(),
        userId,
        slug,
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || email.split("@")[0],
      },
    });

    // Check folder photo count limit
    const existingCount = await prisma.clientPropertyPhoto.count({
      where: { clientId: client.id, folder },
    });
    if (existingCount >= MAX_PHOTOS_PER_FOLDER) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS_PER_FOLDER} photos per folder. Please remove some first.` },
        { status: 400 }
      );
    }

    // Upload file
    const fileExt = file.name.split(".").pop() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    let uploadUrl = "";

    // Strategy 1: Vercel Blob
    if (blobPut && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const path = `client-photos/${userId}/${folder}/${uniqueName}`;
        const blob = await blobPut(path, file, { access: "public" });
        uploadUrl = blob.url;
      } catch (err) {
        console.error("[PropertyPhotos] Vercel Blob failed:", err);
      }
    }

    // Strategy 2: Supabase Storage
    if (!uploadUrl && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createSupabaseAdminClient();
        const bucket = "profile-photos";
        const filePath = `client-photos/${userId}/${folder}/${uniqueName}`;

        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.some((b: any) => b.name === bucket);
        if (!exists) {
          await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: MAX_SIZE,
            allowedMimeTypes: VALID_IMAGE_TYPES,
          });
        }

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, buffer, { contentType: file.type, upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          uploadUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error("[PropertyPhotos] Supabase failed:", err);
      }
    }

    // Strategy 3: data URL fallback
    if (!uploadUrl) {
      if (buffer.length < 2 * 1024 * 1024) {
        uploadUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      } else {
        return NextResponse.json(
          { error: "Storage unavailable. Try a smaller image (<2MB) or try again later." },
          { status: 503 }
        );
      }
    }

    // Create DB record
    const photo = await prisma.clientPropertyPhoto.create({
      data: {
        clientId: client.id,
        folder,
        url: uploadUrl,
        caption,
        mimeType: file.type,
        sizeBytes: file.size,
        sortOrder: existingCount,
      },
    });

    // Also set as primary propertyPhotoUrl if this is the first property photo
    if (folder === "property" && existingCount === 0) {
      await prisma.client.update({
        where: { id: client.id },
        data: { propertyPhotoUrl: uploadUrl },
      });
    }

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("[Property Photos] POST error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

// ─── DELETE: Remove a photo ────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const photoId = request.nextUrl.searchParams.get("id");
    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { userId }, select: { id: true } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Verify ownership
    const photo = await prisma.clientPropertyPhoto.findFirst({
      where: { id: photoId, clientId: client.id },
    });
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    await prisma.clientPropertyPhoto.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Property Photos] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
