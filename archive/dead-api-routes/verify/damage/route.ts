export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/verify/damage
 *
 * End-to-end verification endpoint for damage analysis workflow.
 *
 * Tests:
 * 1. Upload test image to Supabase storage
 * 2. Insert proposal_photos row
 * 3. Enqueue damage-analyze job
 * 4. Poll photo_findings table for results (60s timeout)
 * 5. Return PASS/FAIL with findings
 *
 * @example
 * curl -X POST https://skaiscrape.com/api/verify/damage \
 *   -H "Content-Type: application/json" \
 *   -d '{"proposalId":"...","orgId":"..."}'
 *
 * @returns { ok: true, finding: {...} } or { ok: false, error: string }
 */

import { logger } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { q, qOne } from "@/lib/db/index";
import { enqueue } from "@/lib/queue";

// Test image URL (picsum placeholder)
const TEST_IMAGE_URL = "https://picsum.photos/seed/damage-test/800/600";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Upload test image to Supabase storage
 */
async function uploadTestImage(orgId: string, proposalId: string): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch test image
  const response = await fetch(TEST_IMAGE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch test image: ${response.statusText}`);
  }

  const imageBlob = await response.blob();

  // Generate storage path
  const timestamp = Date.now();
  const fileName = `test-damage-${timestamp}.jpg`;
  const storagePath = `orgs/${orgId}/proposals/${proposalId}/photos/${fileName}`;

  // Upload to Supabase
  const { data, error } = await supabase.storage.from("proposals").upload(storagePath, imageBlob, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload test image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("proposals").getPublicUrl(storagePath);

  return urlData.publicUrl;
}

/**
 * Insert photo record in database
 */
async function insertPhotoRecord(
  proposalId: string,
  orgId: string,
  imageUrl: string
): Promise<string> {
  const [photo] = await q<{ id: string }>(
    `INSERT INTO proposal_photos (proposal_id, org_id, userId, image_url, source)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5)
     RETURNING id`,
    [proposalId, orgId, "verify-system", imageUrl, "e2e-test"]
  );

  if (!photo) {
    throw new Error("Failed to insert photo record");
  }

  return photo.id;
}

/**
 * Poll for findings with timeout
 */
async function pollForFindings(photoId: string, timeoutMs: number = 60000): Promise<any> {
  const startTime = Date.now();
  const pollInterval = 2000; // Check every 2 seconds

  while (Date.now() - startTime < timeoutMs) {
    const finding = await qOne(`SELECT * FROM photo_findings WHERE photo_id = $1::uuid LIMIT 1`, [
      photoId,
    ]);

    if (finding) {
      return finding;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("Timeout waiting for findings");
}

// =============================================================================
// REQUEST HANDLER
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    // Parse request body
    const body = await req.json();
    const { proposalId } = body;

    if (!proposalId) {
      return NextResponse.json(
        {
          ok: false,
          error: "proposalId is required",
        },
        { status: 400 }
      );
    }

    logger.debug(`Starting damage E2E verification for proposal ${proposalId}`);

    // Step 1: Upload test image
    logger.debug("Step 1: Uploading test image...");
    const imageUrl = await uploadTestImage(orgId, proposalId);
    logger.debug(`✓ Image uploaded: ${imageUrl}`);

    // Step 2: Insert photo record
    logger.debug("Step 2: Inserting photo record...");
    const photoId = await insertPhotoRecord(proposalId, orgId, imageUrl);
    logger.debug(`✓ Photo record created: ${photoId}`);

    // Step 3: Enqueue damage analysis job
    logger.debug("Step 3: Enqueuing damage analysis job...");
    const jobId = await enqueue("damage-analyze" as any, [proposalId, orgId, [photoId]]);
    logger.debug(`✓ Job enqueued: ${jobId}`);

    // Step 4: Poll for findings
    logger.debug("Step 4: Polling for findings (60s timeout)...");
    const finding = await pollForFindings(photoId, 60000);
    logger.info(`✓ Finding received:`, {
      severity: finding.severity,
      confidence: finding.confidence,
    });

    // Step 5: Return success
    return NextResponse.json({
      ok: true,
      description: "Damage E2E verification PASSED",
      photoId,
      jobId,
      finding: {
        id: finding.id,
        severity: finding.severity,
        confidence: finding.confidence,
        model: finding.model,
        created_at: finding.created_at,
      },
      imageUrl,
    });
  } catch (error) {
    logger.error("Damage E2E verification FAILED:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
