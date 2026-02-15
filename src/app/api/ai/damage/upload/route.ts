export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * AI Damage Upload API
 *
 * Handles photo uploads for damage analysis:
 * 1. Validates photos and proposal
 * 2. Charges tokens based on photo count
 * 3. Uploads photos to Supabase Storage
 * 4. Records photos in proposal_photos table
 * 5. Enqueues worker job for AI analysis
 *
 * Worker will call OpenAI Vision API and insert findings.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionOrgUser } from "@/lib/auth";
import { insertPhoto } from "@/lib/db/photos-simple";
import prisma from "@/lib/prisma";
import { uploadProposalPhoto } from "@/lib/storage-server";

// =============================================================================
// CONFIGURATION
// =============================================================================

const MAX_PHOTOS = 20; // Max photos per request
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per photo

// =============================================================================
// REQUEST SCHEMA
// =============================================================================

const UploadRequestSchema = z.object({
  proposalId: z.string().uuid("Invalid proposal ID"),
});

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    // Authenticate and get org context
    const { orgId, userId } = await getSessionOrgUser();

    // Parse multipart form data
    const formData = await req.formData();
    const proposalId = formData.get("proposalId") as string;
    const photos = formData.getAll("photos") as File[];

    // Validate request
    const parsed = UploadRequestSchema.safeParse({ proposalId });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.flatten(),
          timestamp: new Date().toISOString(),
        },
        { status: 422 }
      );
    }

    // Validate photos
    if (!photos || photos.length === 0) {
      return NextResponse.json(
        {
          error: "No photos provided",
          timestamp: new Date().toISOString(),
        },
        { status: 422 }
      );
    }

    if (photos.length > MAX_PHOTOS) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_PHOTOS} photos allowed per request`,
          timestamp: new Date().toISOString(),
        },
        { status: 422 }
      );
    }

    // Validate file sizes
    for (const photo of photos) {
      if (photo.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `Photo "${photo.name}" exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
            timestamp: new Date().toISOString(),
          },
          { status: 422 }
        );
      }

      // Validate content type
      if (!photo.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: `File "${photo.name}" is not an image`,
            timestamp: new Date().toISOString(),
          },
          { status: 422 }
        );
      }
    }

    // Verify proposal exists and belongs to org
    const proposal = await prisma.$queryRaw<
      any[]
    >`SELECT id, org_id, status FROM proposals WHERE id = ${proposalId} AND org_id = ${orgId} LIMIT 1`;

    if (!proposal || proposal.length === 0) {
      return NextResponse.json(
        {
          error: "Proposal not found or access denied",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Upload photos and record in database
    const uploadedPhotos: Array<{ id: string; url: string; path: string }> = [];

    for (const photo of photos) {
      try {
        // Convert File to Buffer
        const buffer = Buffer.from(await photo.arrayBuffer());

        // Upload to Supabase Storage
        const { url, path } = await uploadProposalPhoto(orgId, buffer, photo.type);

        // Record in database
        const record = await insertPhoto(proposalId, orgId, userId, url, "api_upload");

        uploadedPhotos.push({
          id: record.id,
          url,
          path,
        });

        console.log(`Photo uploaded: ${record.id} - ${photo.name}`);
      } catch (uploadError: any) {
        console.error(`Failed to upload photo ${photo.name}:`, uploadError);
        // Continue with other photos but log the error
        // NOTE: Consider rolling back tokens if all uploads fail
      }
    }

    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        {
          error: "All photo uploads failed",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // PHASE 2: Queue System Integration
    // Planned: Implement BullMQ or pg-boss for background job processing
    // Benefits: Retry logic, job status tracking, worker scaling
    // For now: Using proposal_events table to track upload requests
    // Implementation: Create @/lib/queue adapter with .enqueue() and worker consumer
    await prisma.$executeRawUnsafe(
      `INSERT INTO proposal_events (proposal_id, event_type, message, metadata)
       VALUES ($1, $2, $3, $4::jsonb)`,
      proposalId,
      "photos_uploaded",
      `${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? "s" : ""} uploaded for damage analysis`,
      JSON.stringify({
        photoIds: uploadedPhotos.map((p) => p.id),
        photoCount: uploadedPhotos.length,
        
        userId,
      })
    );

    // Log activity event
    await prisma.$executeRawUnsafe(
      `INSERT INTO activity_events (org_id, userId, event_type, event_data)
       VALUES ($1, $2, $3, $4::jsonb)`,
      orgId,
      userId,
      "damage_analysis_uploaded",
      JSON.stringify({
        proposalId,
        photoCount: uploadedPhotos.length,
        
      })
    );

    // Enqueue damage analysis job
    const { enqueue } = await import("@/lib/queue");
    const jobId = await enqueue(
      "damage-analyze" as any,
      {
        proposalId,
        orgId,
        photoIds: uploadedPhotos.map((p) => p.id),
      } as any
    );

    // Return success response
    return NextResponse.json({
      success: true,
      proposalId,
      photos: uploadedPhotos.map((p) => ({
        id: p.id,
        url: p.url,
      })),
      tokensCharged: 0,
      description: `${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? "s" : ""} uploaded successfully. Analysis queued.`,
      jobId, // Job ID for tracking
    });
  } catch (error: any) {
    console.error("AI Damage Upload failed:", error);

    // Handle auth errors
    if (error.message?.includes("Unauthorized") || error.message?.includes("organization")) {
      return NextResponse.json(
        {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Generic server error
    return NextResponse.json(
      {
        error: "Internal server error",
        cause: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// EXPORT TYPES FOR CLIENT
// =============================================================================

export interface DamageUploadResponse {
  success: true;
  proposalId: string;
  photos: Array<{ id: string; url: string }>;
  tokensCharged: number;
  description: string;
  jobId?: string; // When queue is implemented
}
