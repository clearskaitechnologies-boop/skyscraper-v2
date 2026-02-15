/**
 * Get or Create Thread for Client Connection
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";
import { getOrCreateClientThread } from "@/lib/trades/vendorSync";

// POST /api/connections/thread - Get or create message thread
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // CRITICAL FIX: Use unified org context (auto-creates if needed)
    const { orgId } = await ensureUserOrgContext(userId);

    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    const thread = await getOrCreateClientThread(orgId, clientId);

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error("[POST /api/connections/thread] Error:", error);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}
