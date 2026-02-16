/**
 * /api/retail/list/route.ts
 *
 * GET endpoint to list all retail packets for current user
 * Returns:
 * - packets: Array of retail_packets
 * - Sorted by updated_at DESC
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "UNAUTHENTICATED" }, { status: 401 });
    }

    // Check if table exists
    const { data: tableExists } = await supabase.from("retail_packets").select("id").limit(1);

    if (!tableExists) {
      return NextResponse.json({
        ok: true,
        packets: [],
        description: "DB_NOT_MIGRATED",
      });
    }

    // Fetch all packets for user
    const { data: packets, error } = await supabase
      .from("retail_packets")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      logger.error("[API /retail/list] Supabase error:", error);
      return NextResponse.json({ ok: false, error: "DATABASE_ERROR" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      packets: packets || [],
    });
  } catch (err) {
    logger.error("[API /retail/list] Unexpected error:", err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
