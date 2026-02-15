import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { uploadSupabase } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Phase 1: Storage Core Wiring
 * Upload files to Supabase and create claim_documents records
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;

    const formData = await req.formData();
    const claimId = formData.get("claimId") as string;
    const orgIdParam = formData.get("orgId") as string;
    const files = formData.getAll("files") as File[];

    // Validation
    if (!claimId) {
      return NextResponse.json({ error: "Missing claimId" }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Verify org access
    if (orgIdParam && orgIdParam !== orgId) {
      return NextResponse.json({ error: "Organization mismatch" }, { status: 403 });
    }

    // Verify claim belongs to org
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (claim.orgId !== orgId) {
      return NextResponse.json({ error: "Claim not in your organization" }, { status: 403 });
    }

    // File limits
    if (files.length > 10) {
      return NextResponse.json({ error: "Maximum 10 files per upload" }, { status: 400 });
    }

    const results: Array<{
      id: string;
      title: string;
      publicUrl: string;
    }> = [];

    const errors: Array<{
      filename: string;
      error: string;
    }> = [];

    // Process each file
    for (const file of files) {
      try {
        // Size validation
        const maxSize = file.type.startsWith("image/") ? 25 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push({ filename: file.name, error: "File too large" });
          continue;
        }

        // MIME type validation
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/heic",
          "application/pdf",
        ];

        if (!allowedTypes.includes(file.type)) {
          errors.push({ filename: file.name, error: "File type not allowed" });
          continue;
        }

        // Determine file type
        const isPhoto = file.type.startsWith("image/");
        const bucket = isPhoto ? "photos" : "documents";
        const fileType = isPhoto ? "PHOTO" : "DOCUMENT";

        // Upload to Supabase
        const folder = `claims/${claimId}`;
        const { url: publicUrl, path: storageKey } = await uploadSupabase(file, bucket, folder);

        // Create FileAsset record
        const doc = await prisma.file_assets.create({
          data: {
            id: crypto.randomUUID(),
            orgId,
            ownerId: userId,
            claimId,
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            storageKey,
            bucket,
            publicUrl,
            category: fileType.toLowerCase(),
            updatedAt: new Date(),
          },
        });

        results.push({
          id: doc.id,
          title: doc.filename,
          publicUrl: doc.publicUrl,
        });

        console.log(`[claims:files:upload] Uploaded ${file.name} for claim ${claimId}`);

        // TASK 6: Notify client if they have portal access
        try {
          const portalAccess = await prisma.client_access.findFirst({
            where: { claimId },
          });

          if (portalAccess?.email) {
            // Get Pro's company name
            const user = await prisma.users.findFirst({
              where: { clerkUserId: userId },
              select: { name: true },
            });

            const org = await prisma.org.findUnique({
              where: { id: orgId },
              select: { name: true },
            });

            // Client notification via email could be added here
            console.log(
              `[FILE_NOTIFICATION] File added for client ${portalAccess.email}, org: ${org?.name || user?.name}`
            );
          }
        } catch (notifError) {
          // Don't fail upload if notification fails
          console.error("[FILE_NOTIFICATION]", notifError);
        }
      } catch (fileError: any) {
        console.error(`[claims:files:upload] Error processing ${file.name}:`, fileError);
        errors.push({
          filename: file.name,
          error: fileError.message || "Upload failed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: results,
      errors: errors,
      totalUploaded: results.length,
      totalErrors: errors.length,
    });
  } catch (error: any) {
    console.error("[claims:files:upload] Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
