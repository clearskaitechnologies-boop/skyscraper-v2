// Portal photo upload API - allows EDITOR clients to upload photos to their claims
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { assertPortalAccess } from "@/lib/auth/portalAccess";
import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";
import { uploadBuffer } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Rate limiting (in-memory, simple)
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // 10 uploads per 10 minutes
const RATE_WINDOW = 10 * 60 * 1000;

/**
 * GET /api/portal/claims/[claimId]/photos
 * List photos uploaded via portal
 */
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const { claimId } = params;

    // Validate portal access (any role can view)
    try {
      await assertPortalAccess({ userId, claimId });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Get claim's projectId
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { projectId: true },
    });

    if (!claim?.projectId) {
      return NextResponse.json({ photos: [] });
    }

    // Fetch photos (documents of type PHOTO)
    const photos = await prisma.documents.findMany({
      where: {
        projectId: claim.projectId,
        type: "PHOTO",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        url: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      photos: photos.map((p) => ({
        id: p.id,
        title: p.title,
        publicUrl: p.url,
        mimeType: p.mimeType,
        fileSize: p.sizeBytes,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("[PORTAL_PHOTOS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

/**
 * POST /api/portal/claims/[claimId]/photos
 * Upload photo from portal (EDITOR role required)
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const { claimId } = params;

    // Verify portal access + get access record
    let access;
    try {
      access = await assertPortalAccess({ userId, claimId });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // ⚡ REQUIRE EDITOR ROLE
    if (access.role !== "EDITOR") {
      return NextResponse.json(
        { error: "Upload permission denied: EDITOR role required" },
        { status: 403 }
      );
    }

    // Rate limiting
    const now = Date.now();
    const userKey = `${userId}:${claimId}`;
    const attempts = uploadAttempts.get(userKey);

    if (attempts) {
      if (now < attempts.resetAt) {
        if (attempts.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Try again later." },
            { status: 429 }
          );
        }
        attempts.count += 1;
      } else {
        uploadAttempts.set(userKey, { count: 1, resetAt: now + RATE_WINDOW });
      }
    } else {
      uploadAttempts.set(userKey, { count: 1, resetAt: now + RATE_WINDOW });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const caption = (formData.get("caption") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: JPEG, PNG, WebP, HEIC` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size: 10MB` }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "jpg";
    const s3Key = `claims/${claimId}/portal-photos/${nanoid()}.${fileExtension}`;

    // Upload to S3
    await uploadBuffer(buffer, s3Key, file.type);

    // Get claim's projectId and orgId
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { projectId: true, orgId: true },
    });

    if (!claim?.projectId) {
      return NextResponse.json({ error: "Claim has no project" }, { status: 400 });
    }

    // Create database record
    const photo = await prisma.documents.create({
      data: {
        id: nanoid(),
        projectId: claim.projectId,
        orgId: claim.orgId,
        type: "PHOTO",
        title: caption || file.name,
        url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
        sizeBytes: file.size,
        mimeType: file.type,
        isPublic: true,
        createdBy: userId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error: any) {
    console.error("[PORTAL_PHOTOS_POST_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to upload photo" }, { status: 500 });
  }
}
