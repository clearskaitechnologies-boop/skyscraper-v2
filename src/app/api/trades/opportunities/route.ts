import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Prisma singleton imported from @/lib/db/prisma

/**
 * GET /api/trades/opportunities
 * Query params: ?trade=Roofing&city=Austin&state=TX
 *
 * Returns list of active job opportunities with filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trade = searchParams.get("trade");
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    let query = `
      SELECT 
        p.id,
        p.created_by,
        p.title,
        p.body,
        p.trade,
        p.city,
        p.state,
        p.created_at,
        (
          SELECT COUNT(*) 
          FROM tn_threads t 
          WHERE t.post_id = p.id
        ) as applicant_count
      FROM tn_posts p
      WHERE p.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (trade) {
      query += ` AND p.trade = $${paramIndex}`;
      params.push(trade);
      paramIndex++;
    }

    if (city) {
      query += ` AND LOWER(p.city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }

    if (state) {
      query += ` AND UPPER(p.state) = UPPER($${paramIndex})`;
      params.push(state);
      paramIndex++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT 100`;

    const opportunities = await prisma.$queryRawUnsafe(query, ...params);

    return NextResponse.json({
      ok: true,
      opportunities,
      count: Array.isArray(opportunities) ? opportunities.length : 0,
    });
  } catch (err: any) {
    console.error("Get opportunities error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/trades/opportunities
 * Body: { title: string, body: string, trade: string, city?: string, state?: string }
 *
 * Create a new opportunity (Full Access required)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await import("@clerk/nextjs/server").then((m) => m.auth());

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, trade, city, state } = await req.json();

    if (!title || !trade) {
      return NextResponse.json({ error: "Missing required fields: title, trade" }, { status: 400 });
    }

    // Check Full Access
    const hasFullAccess: any = await prisma.$queryRaw`
      SELECT has_full_access(${userId}::uuid) as has_access
    `;

    if (!hasFullAccess[0]?.has_access) {
      return NextResponse.json(
        {
          error: "full_access_required",
          description: "You need Full Access ($9.99/mo) to post opportunities",
        },
        { status: 403 }
      );
    }

    // Create post
    const post: any = await prisma.$queryRaw`
      INSERT INTO tn_posts (created_by, title, body, trade, city, state)
      VALUES (${userId}::uuid, ${title}, ${body || ""}, ${trade}, ${city || null}, ${state || null})
      RETURNING id, created_by, title, body, trade, city, state, created_at
    `;

    return NextResponse.json({
      ok: true,
      post: post[0],
    });
  } catch (err: any) {
    console.error("Create opportunity error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
