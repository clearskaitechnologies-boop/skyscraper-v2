import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { safeOrgContext } from "@/lib/safeOrgContext";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
    const ctx = await safeOrgContext();

    const resolvedOrgId = ctx.orgId ?? null;

    const source = (() => {
      if (!clerkUserId) return "unauthenticated";
      if (ctx.membership?.synthetic) return "legacy-users.orgId-fallback";
      if (ctx.status === "ok" && ctx.membership) return "membership";
      if (ctx.status === "noMembership") return "no-membership";
      if (ctx.status === "error") return "error";
      return "unknown";
    })();

    return NextResponse.json({
      ok: Boolean(resolvedOrgId),
      clerk: {
        userId: clerkUserId ?? null,
        orgId: clerkOrgId ?? null,
      },
      resolution: {
        ok: Boolean(resolvedOrgId),
        orgId: resolvedOrgId,
        source,
      },
      context: {
        status: ctx.status,
        membership: ctx.membership
          ? {
              id: ctx.membership.id,
              organizationId: ctx.membership.organizationId,
              role: ctx.membership.role,
              synthetic: Boolean((ctx.membership as any)?.synthetic),
            }
          : null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "__truth failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
