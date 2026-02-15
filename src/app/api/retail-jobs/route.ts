export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

import { getCurrentUserPermissions } from "@/lib/permissions";

/**
 * Retail Jobs API
 *
 * NOTE: The RetailJob, RetailJobMaterial, and RetailJobTimeline models
 * are not yet defined in the Prisma schema. This API is stubbed until
 * the database migration is applied.
 *
 * TODO: Add RetailJob models to prisma/schema.prisma and run migrations
 */

export async function POST(_request: NextRequest) {
  try {
    const { orgId } = await getCurrentUserPermissions();

    if (!orgId) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    // RetailJob model not yet implemented in Prisma schema
    return Response.json(
      { error: "Retail jobs feature is not yet available. Database migration pending." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error in retail jobs POST:", error);
    return Response.json({ error: "Failed to process retail job request" }, { status: 500 });
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { orgId } = await getCurrentUserPermissions();

    if (!orgId) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    // RetailJob model not yet implemented in Prisma schema
    return Response.json(
      {
        retailJobs: [],
        message: "Retail jobs feature is not yet available. Database migration pending.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in retail jobs GET:", error);
    return Response.json({ error: "Failed to fetch retail jobs" }, { status: 500 });
  }
}
