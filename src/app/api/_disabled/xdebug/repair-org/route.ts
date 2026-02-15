/**
 * REPAIR ORG ENDPOINT
 *
 * Forces org creation for signed-in user who is stuck without org.
 * Called by "Repair Org Now" button in error UI.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getActiveOrgSafe } from "@/lib/auth/getActiveOrgSafe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const timestamp = new Date().toISOString();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({
        ok: false,
        reason: "NO_SESSION",
        message: "Must be signed in to repair org",
        timestamp,
      });
    }

    console.log("[REPAIR_ORG] Force-creating org for user:", userId);

    // Force auto-create
    const result = await getActiveOrgSafe({ allowAutoCreate: true });

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        message: "Organization created successfully",
        org: {
          id: result.org.id,
          name: result.org.name,
          source: result.source,
        },
        timestamp,
      });
    }

    return NextResponse.json({
      ok: false,
      reason: result.reason,
      error: result.error,
      message: "Failed to create organization",
      timestamp,
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      reason: "UNEXPECTED_ERROR",
      error: error.message,
      timestamp,
    });
  }
}
