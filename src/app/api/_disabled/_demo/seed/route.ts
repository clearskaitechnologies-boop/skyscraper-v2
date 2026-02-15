import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getActiveOrgContext } from "@/lib/auth/tenant";
import { ensureDemoDataForOrg } from "@/lib/demoSeed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/_demo/seed
 * Forces demo data creation for current org
 * Protected endpoint - requires authentication
 */
export async function POST() {
  try {
    // Require auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active org
    const orgContext = await getActiveOrgContext();
    if (!orgContext.ok || !orgContext.orgId) {
      const errorDetails = !orgContext.ok ? orgContext.error : undefined;
      return NextResponse.json(
        { error: "No organization found", details: errorDetails },
        { status: 400 }
      );
    }

    const orgId = orgContext.orgId;

    console.log(`[SEED_ENDPOINT] Starting demo seed for org: ${orgId}, user: ${userId}`);

    // Force seed
    const result = await ensureDemoDataForOrg({ orgId, userId });

    console.log(`[SEED_ENDPOINT] Completed:`, result);

    return NextResponse.json({
      seeded: true,
      orgId,
      userId,
      demoClaimId: result.claimId || null,
      demoClaimNumber: result.claimNumber || null,
      demoPropertyId: result.propertyId || null,
    });
  } catch (error: any) {
    console.error("[SEED_ENDPOINT] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed demo data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST to trigger demo seed",
      endpoint: "/api/_demo/seed",
      method: "POST",
      auth: "required",
    },
    { status: 405 }
  );
}
