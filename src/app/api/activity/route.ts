/**
 * Activity Feed API Route
 *
 * GET  /api/activity - List recent activities for org
 * POST /api/activity - Create new activity entry
 *
 * Used by: Dashboard activity feed, real-time notifications
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/activity
 *
 * Returns recent activities for the current user's organization
 *
 * Query params:
 * - limit: number of activities to return (default: 20, max: 100)
 * - type: filter by activity type (lead_created, claim_updated, etc.)
 * - userId: filter by specific user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedOrgId = orgId || userId;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const type = searchParams.get("type");
    const filterUserId = searchParams.get("userId");

    // Build where clause
    const where: any = { orgId: resolvedOrgId };
    if (type) where.type = type;
    if (filterUserId) where.userId = filterUserId;

    // Fetch activities
    const activities = await prisma.activities.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        leads: {
          select: {
            id: true,
            title: true,
          },
        },
        claims: {
          select: {
            id: true,
            claimNumber: true,
          },
        },
        jobs: {
          select: {
            id: true,
            title: true,
          },
        },
        contacts: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      activities,
      count: activities.length,
      limit,
    });
  } catch (error) {
    console.error("[GET /api/activity] Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

/**
 * POST /api/activity
 *
 * Create a new activity entry
 *
 * Body:
 * {
 *   type: string (required) - Activity type
 *   title: string (required) - Activity title
 *   description?: string - Optional description
 *   leadId?: string - Associated lead ID
 *   claimId?: string - Associated claim ID
 *   jobId?: string - Associated job ID
 *   contactId?: string - Associated contact ID
 *   metadata?: object - Additional metadata
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedOrgId = orgId || userId;

    // Get user's name from Clerk with caching
    const { getUserName } = await import("@/lib/clerk-utils");
    const userName = await getUserName(userId);

    const body = await request.json();
    const {
      type,
      title,
      description,
      leadId,
      claimId,
      jobId,
      contactId,
      projectId,
      inspectionId,
      metadata,
    } = body;

    // Validation
    if (!type || !title) {
      return NextResponse.json({ error: "type and title are required" }, { status: 400 });
    }

    // Create activity
    const activity = await prisma.activities.create({
      data: {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        orgId: resolvedOrgId,
        userId,
        userName,
        type,
        title,
        description,
        leadId,
        claimId,
        jobId,
        contactId,
        projectId,
        inspectionId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/activity] Error:", error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
