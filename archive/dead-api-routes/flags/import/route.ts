export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { setFlag, targetingSchema } from "@/lib/flags";
import { withSentryApi } from "@/lib/monitoring/sentryApi";
import { requireAdmin } from "@/lib/security/roles";

export const POST = withSentryApi(async (req: Request) => {
  try {
    await requireAdmin();
    const body = await req.json();
    if (!Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Invalid import format: items[] required" },
        { status: 400 }
      );
    }
    const results: any[] = [];
    for (const flag of body.items) {
      try {
        // Validate targeting
        if (flag.targeting && !targetingSchema.safeParse(flag.targeting).success) {
          throw new Error("Invalid targeting schema");
        }
        await setFlag(
          flag.key,
          !!flag.enabled,
          flag.orgId || null,
          flag.rolloutPercent === undefined
            ? 100
            : Math.max(0, Math.min(100, parseInt(flag.rolloutPercent))),
          flag.targeting || null
        );
        results.push({ key: flag.key, status: "imported" });
      } catch (err) {
        results.push({ key: flag.key, status: "error", error: err?.message });
      }
    }
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err?.message || "Unauthorized" }, { status: 401 });
  }
});
