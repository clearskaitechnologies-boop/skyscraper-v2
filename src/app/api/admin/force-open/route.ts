import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.userId) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }
    const { userId } = ctx;

    // Verify admin role from Clerk metadata
    const clerkUser = await clerkClient().users.getUser(userId);
    const isAdmin = clerkUser.publicMetadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { forceOpen } = await req.json();

    console.log(`Admin ${userId} attempting to ${forceOpen ? "enable" : "disable"} force open`);

    // Note: This is a mock implementation since we can't actually change environment variables at runtime
    // In production, you might:
    // 1. Store this setting in a database
    // 2. Use a feature flag service
    // 3. Store in Redis/cache
    // 4. Or implement your own override mechanism

    return NextResponse.json({
      success: true,
      description: "Force open setting updated",
      note: "This is a mock implementation - implement persistent storage for production use",
    });
  } catch (error) {
    console.error("Force open toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle force open" }, { status: 500 });
  }
}
