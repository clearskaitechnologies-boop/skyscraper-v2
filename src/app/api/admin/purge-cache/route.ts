import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { log } from "@/lib/logger";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/purge-cache
 * Purge Next.js cache for instant updates
 * Requires authentication
 */
export async function POST() {
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

    // Purge all major routes
    const routes = [
      "/",
      "/dashboard",
      "/claims",
      "/ai-tools",
      "/portal",
      "/pricing",
      "/marketplace",
    ];

    for (const route of routes) {
      revalidatePath(route);
    }

    // Also purge layout
    revalidatePath("/", "layout");

    (log as any)("admin/purge-cache", "Cache purged successfully", { userId, routes });

    return NextResponse.json({
      ok: true,
      cache: "purged",
      routes,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    (log as any)("admin/purge-cache", "Cache purge failed", { error: error.message });
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
