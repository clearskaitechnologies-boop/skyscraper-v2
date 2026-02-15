/**
 * POST /api/claims/save
 *
 * Autosaves a step fragment into the claim_report's JSONB data field.
 * Similar to /api/retail/save but uses claim_reports table and 11 steps
 */

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SaveRequestBody {
  reportId: string;
  step: number;
  fragment: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    const body: SaveRequestBody = await request.json();
    const { reportId, step, fragment } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (typeof step !== "number" || step < 1 || step > 11) {
      return NextResponse.json(
        { error: "Invalid step number (must be 1-11)", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (!fragment || typeof fragment !== "object" || Object.keys(fragment).length === 0) {
      return NextResponse.json(
        { error: "Fragment must be non-empty object", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    // Check table exists
    const { error: tableCheckError } = await supabase.from("claim_reports").select("id").limit(1);

    if (tableCheckError?.code === "42P01") {
      return NextResponse.json(
        {
          error: "Database not migrated",
          code: "DB_NOT_MIGRATED",
          description: "Run db/migrations/2025-11-Phase1A-claims.sql in Supabase SQL Editor",
        },
        { status: 503 }
      );
    }

    // Verify report exists and belongs to user
    const { data: existingReport, error: fetchError } = await supabase
      .from("claim_reports")
      .select("id, userId, current_step, data")
      .eq("id", reportId)
      .single();

    if (fetchError || !existingReport) {
      return NextResponse.json({ error: "Report not found", code: "NOT_FOUND" }, { status: 404 });
    }

    if (existingReport.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized - report belongs to different user", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Merge fragment
    const currentData = (existingReport.data || {}) as Record<string, any>;
    const mergedData = { ...currentData, ...fragment };

    const { data, error } = await supabase
      .from("claim_reports")
      .update({
        data: mergedData,
        current_step: Math.max(existingReport.current_step, step),
      })
      .eq("id", reportId)
      .select("updated_at")
      .single();

    if (error) {
      console.error("[claims/save] Update error:", error);
      return NextResponse.json(
        { error: "Failed to save fragment", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      savedAt: data?.updated_at || new Date().toISOString(),
      description: `Step ${step} fragment saved`,
    });
  } catch (err) {
    console.error("[claims/save] Unexpected error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
