/**
 * Design Board API — Save & load client design boards
 * GET  /api/portal/design-board — list client's boards
 * POST /api/portal/design-board — create / update a board
 *
 * Boards are stored as JSON in the Client model's metadata or as
 * a lightweight key-value pair until a dedicated table is added.
 * For now we store in localStorage on the client side and this API
 * is a placeholder for future server persistence.
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Future: fetch from DB. For now, boards are client-side only.
    return NextResponse.json({
      success: true,
      boards: [],
      message: "Design boards are stored locally. Server sync coming soon.",
    });
  } catch (error) {
    logger.error("[Design Board] Error:", error);
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, items } = body;

    if (!name || !items) {
      return NextResponse.json({ error: "Name and items required" }, { status: 400 });
    }

    // Future: persist to DB
    return NextResponse.json({
      success: true,
      board: { id: `board_${Date.now()}`, name, items, createdAt: new Date().toISOString() },
      message: "Board saved (local). Server sync coming soon.",
    });
  } catch (error) {
    logger.error("[Design Board] Error:", error);
    return NextResponse.json({ error: "Failed to save board" }, { status: 500 });
  }
}
