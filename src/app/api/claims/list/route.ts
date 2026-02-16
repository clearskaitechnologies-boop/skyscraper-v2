/**
 * /api/claims/list/route.ts
 *
 * GET endpoint to list all claim reports for current user
 * Returns:
 * - reports: Array of claim_reports
 * - Sorted by updated_at DESC
 */

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    // Check if table exists
    const { data: tableExists } = await supabase.from("claim_reports").select("id").limit(1);

    if (!tableExists) {
      return NextResponse.json({
        ok: true,
        reports: [],
        description: "DB_NOT_MIGRATED",
      });
    }

    // Fetch all reports for user
    const { data: reports, error } = await supabase
      .from("claim_reports")
      .select("*")
      .eq("userId", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[API /claims/list] Supabase error:", error);
      return NextResponse.json({ ok: false, error: "DATABASE_ERROR" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      reports: reports || [],
    });
  } catch (err) {
    console.error("[API /claims/list] Unexpected error:", err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
