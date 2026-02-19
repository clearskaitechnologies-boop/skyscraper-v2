export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Signed Read URL API
 * 
 * Generates short-lived signed URLs for reading private files from Supabase Storage.
 * Verifies org ownership before granting access.
 * 
 * Used for displaying uploaded photos in UI without exposing permanent URLs.
 */

import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionOrgUser } from "@/lib/auth";

// =============================================================================
// REQUEST SCHEMA
// =============================================================================

const SignedReadRequestSchema = z.object({
  path: z.string().min(10, "Path too short"),
  expiresIn: z.number().int().min(60).max(3600).optional().default(300), // 5 min default
});

// =============================================================================
// MAIN HANDLER
// =============================================================================

export async function POST(req: Request) {
  try {
    // Authenticate and get org context
    const { orgId } = await getSessionOrgUser();

    // Validate request body
    const body = await req.json().catch(() => ({}));
    const parsed = SignedReadRequestSchema.safeParse(body);

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

    const { path, expiresIn } = parsed.data;

    // Verify path belongs to org (security check)
    if (!path.startsWith(`orgs/${orgId}/`)) {
      logger.warn(`Access denied: User ${orgId} attempted to access ${path}`);
      return NextResponse.json(
        {
          error: "Forbidden: Path does not belong to your organization",
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

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

    // Generate signed read URL
    const { data, error } = await supabase.storage
      .from("proposals")
      .createSignedUrl(path, expiresIn);

    if (error) {
      logger.error("Failed to create signed read URL:", error);
      return NextResponse.json(
        {
          error: error.message || "Failed to generate read URL",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Return signed URL
    return NextResponse.json({
      url: data.signedUrl,
      path,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    logger.error("Signed read URL generation failed:", error);

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
