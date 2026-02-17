/**
 * POST /api/retail/start
 *
 * Creates a new draft retail_packet for the authenticated user.
 * Returns { packetId: string } for subsequent autosave calls.
 *
 * Guards:
 * - Requires Clerk authentication
 * - Soft-fails if table doesn't exist (returns error code for UI banner)
 * - Uses Node runtime for Supabase compatibility
 */

import { logger } from "@/lib/observability/logger";
import { getStorageClient } from "@/lib/storage/client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  try {
    // 1) Auth guard
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const supabase = getStorageClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Storage not configured", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    // 2) Check if table exists (soft guard for dev environments)
    const { error: tableCheckError } = await supabase.from("retail_packets").select("id").limit(1);

    if (tableCheckError?.code === "42P01") {
      // Table doesn't exist (PostgreSQL error code for undefined_table)
      return NextResponse.json(
        {
          error: "Database not migrated",
          code: "DB_NOT_MIGRATED",
          description: "Run db/migrations/2025-11-Phase1A-retail.sql in Supabase SQL Editor",
        },
        { status: 503 }
      );
    }

    // 3) Create draft packet
    const { data, error } = await supabase
      .from("retail_packets")
      .insert({
        userId: userId,
        current_step: 1,
        data: {}, // Empty JSONB object
      })
      .select("id")
      .single();

    if (error) {
      logger.error("[retail/start] Insert error:", error);
      return NextResponse.json(
        { error: "Failed to create draft", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "No packet returned after insert" }, { status: 500 });
    }

    // 4) Success - return packetId
    return NextResponse.json({
      packetId: data.id,
      description: "Draft created",
    });
  } catch (err) {
    logger.error("[retail/start] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
