/**
 * POST /api/retail/save
 *
 * Autosaves a step fragment into the retail_packet's JSONB data field.
 * Merges new fragment with existing data using JSONB || operator.
 * Updates current_step to highest step reached.
 *
 * Body: { packetId: string, step: number, fragment: Record<string, any> }
 *
 * Guards:
 * - Requires Clerk authentication
 * - Validates packetId exists and belongs to user
 * - Requires non-empty fragment
 * - Soft-fails if table doesn't exist
 */

import { logger } from "@/lib/observability/logger";
import { getStorageClient } from "@/lib/storage/client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SaveRequestBody {
  packetId: string;
  step: number;
  fragment: Record<string, any>;
}

export async function POST(request: NextRequest) {
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

    // 2) Parse body
    const body: SaveRequestBody = await request.json();
    const { packetId, step, fragment } = body;

    // 3) Validate inputs
    if (!packetId) {
      return NextResponse.json(
        { error: "Missing packetId", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (typeof step !== "number" || step < 1 || step > 8) {
      return NextResponse.json(
        { error: "Invalid step number (must be 1-8)", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (!fragment || typeof fragment !== "object" || Object.keys(fragment).length === 0) {
      return NextResponse.json(
        { error: "Fragment must be non-empty object", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // 4) Check if table exists (soft guard)
    const { error: tableCheckError } = await supabase.from("retail_packets").select("id").limit(1);

    if (tableCheckError?.code === "42P01") {
      return NextResponse.json(
        {
          error: "Database not migrated",
          code: "DB_NOT_MIGRATED",
          description: "Run db/migrations/2025-11-Phase1A-retail.sql in Supabase SQL Editor",
        },
        { status: 503 }
      );
    }

    // 5) Verify packet exists and belongs to user
    const { data: existingPacket, error: fetchError } = await supabase
      .from("retail_packets")
      .select("id, user_id, current_step, data")
      .eq("id", packetId)
      .single();

    if (fetchError || !existingPacket) {
      return NextResponse.json({ error: "Packet not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (existingPacket.user_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - packet belongs to different user", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 6) Merge fragment into JSONB data
    // Fetch current data, merge in-memory, then update
    const currentData = (existingPacket.data || {}) as Record<string, any>;
    const mergedData = { ...currentData, ...fragment };

    const { data, error } = await supabase
      .from("retail_packets")
      .update({
        data: mergedData,
        current_step: Math.max(existingPacket.current_step, step),
      })
      .eq("id", packetId)
      .select("updated_at")
      .single();

    if (error) {
      logger.error("[retail/save] Update error:", error);
      return NextResponse.json(
        { error: "Failed to save fragment", details: error.message },
        { status: 500 }
      );
    }

    // 7) Success - return timestamp
    return NextResponse.json({
      ok: true,
      savedAt: data?.updated_at || new Date().toISOString(),
      description: `Step ${step} fragment saved`,
    });
  } catch (err) {
    logger.error("[retail/save] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
