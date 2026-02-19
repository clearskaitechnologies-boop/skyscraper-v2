export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Signed Upload URL API
 *
 * Generates signed upload URLs for client-side file uploads to Supabase Storage.
 * Scopes uploads to org/proposal paths for RLS enforcement.
 *
 * Path structure: orgs/{orgId}/proposals/{proposalId}/photos/{uuid}-{fileName}
 */

import { logger } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionOrgUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

// =============================================================================
// REQUEST SCHEMA
// =============================================================================

const SignedUploadRequestSchema = z.object({
  proposalId: z.string().uuid("Invalid proposal ID"),
  fileName: z.string().min(1, "File name required"),
  contentType: z.string().optional(),
});

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    // Authenticate and get org context
    const { orgId } = await getSessionOrgUser();

    // Rate limit storage uploads
    const rl = await checkRateLimit(orgId, "UPLOAD");
    if (!rl.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    // Validate request body
    const body = await req.json().catch(() => ({}));
    const parsed = SignedUploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: parsed.error.flatten(),
          timestamp: new Date().toISOString(),
        },
        { status: 422 }
      );
    }

    const { proposalId, fileName, contentType } = parsed.data;

    // Check environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      logger.error("Supabase configuration missing");
      return NextResponse.json(
        {
          error: "Storage not configured. Contact administrator.",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Build org-scoped storage path
    const uuid = crypto.randomUUID();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `orgs/${orgId}/proposals/${proposalId}/photos/${uuid}-${sanitizedFileName}`;

    // Generate signed upload URL (5 minute expiry)
    const { data, error } = await supabase.storage.from("proposals").createSignedUploadUrl(key);

    if (error) {
      logger.error("Failed to create signed upload URL:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to generate upload URL",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Return signed URL and path
    return NextResponse.json({
      url: data.signedUrl, // PUT to this URL with file body
      path: key, // Save this for later retrieval
      token: data.token, // Optional: upload token
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
    });
  } catch (error) {
    logger.error("Signed upload URL generation failed:", error);

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
