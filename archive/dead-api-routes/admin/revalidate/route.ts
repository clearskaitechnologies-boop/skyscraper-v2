import { logger } from "@/lib/logger";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Admin-only endpoint to purge Next.js ISR cache
 * POST /api/admin/revalidate
 * Body: { path?: string, tag?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.userId) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }
    const { userId } = ctx;

    const rl = await checkRateLimit(userId, "API");
    if (!rl.success) {
      return NextResponse.json(
        { error: "rate_limit_exceeded", message: "Too many requests" },
        { status: 429 }
      );
    }

    // Verify admin role from Clerk metadata
    const clerkUser = await clerkClient().users.getUser(userId);
    const isAdmin = clerkUser.publicMetadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { path, tag } = body;

    // Guard against undefined/empty values
    if (path && typeof path === "string" && path.trim()) {
      revalidatePath(path);
      logger.debug(`[Revalidate] Purged path: ${path}`);
    }

    if (tag && typeof tag === "string" && tag.trim()) {
      revalidateTag(tag);
      logger.debug(`[Revalidate] Purged tag: ${tag}`);
    }

    return NextResponse.json(
      { ok: true, purged: { path, tag } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    logger.error("[Revalidate] Error:", error);
    return NextResponse.json(
      { error: error.message || "Revalidation failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
