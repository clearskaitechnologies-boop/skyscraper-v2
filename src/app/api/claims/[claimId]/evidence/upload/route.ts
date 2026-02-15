/**
 * POST /api/claims/[claimId]/evidence/upload
 * Upload evidence files with auto-bucketing into collections
 */

import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import { detectSection, extractFilenameMetadata } from "@/lib/evidence/autoBucketEvidence";
import { uploadEvidence } from "@/lib/evidence/storage";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    const { claimId } = params;

    // Org is required for evidence uploads
    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 403 });
    }

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sectionKey = formData.get("sectionKey") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images, videos, PDFs)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heic",
      "image/webp",
      "video/mp4",
      "video/quicktime",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, HEIC, MP4, MOV, PDF" },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Max 50MB" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const uploadResult = await uploadEvidence({
      orgId,
      claimId,
      file,
      originalName: file.name,
    });

    // Extract metadata from filename
    const filenameMetadata = extractFilenameMetadata(file.name);

    // Auto-detect section if not provided
    let detectedSection = sectionKey;
    let autoDetected = false;

    if (!detectedSection) {
      const detection = detectSection(file.name);
      if (detection) {
        detectedSection = detection.sectionKey;
        autoDetected = true;
      }
    }

    // Create FileAsset record
    const asset = await prisma.file_assets.create({
      data: {
        id: uploadResult.assetId,
        orgId,
        ownerId: userId,
        claimId: claimId || undefined,
        filename: uploadResult.fileName,
        storageKey: uploadResult.storagePath,
        bucket: "evidence",
        publicUrl: "", // Will be generated on-demand via signed URLs
        mimeType: uploadResult.mimeType,
        sizeBytes: uploadResult.sizeBytes,
        category: detectedSection ?? "other",
        ai_tags: filenameMetadata.keywords,
        updatedAt: new Date(),
      },
    });

    // Section is stored in the category field of FileAsset
    // Collection functionality requires EvidenceCollection model (future enhancement)
    const collectionItem = detectedSection ? { sectionKey: detectedSection } : null;

    return NextResponse.json({
      success: true,
      asset: {
        id: asset.id,
        filename: asset.filename,
        originalName: file.name,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        createdAt: asset.createdAt,
        category: asset.category,
        tags: asset.ai_tags,
      },
      collection: collectionItem
        ? {
            sectionKey: detectedSection,
            autoDetected,
          }
        : null,
    });
  } catch (error) {
    console.error("Evidence upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
