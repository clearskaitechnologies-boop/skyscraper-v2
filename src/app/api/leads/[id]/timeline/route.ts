/**
 * GET /api/leads/[leadId]/timeline
 * Returns timeline events for a lead
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { compose, safeAuth, withOrgScope, withRateLimit, withSentryApi } from "@/lib/api/wrappers";
import prisma from "@/lib/prisma";

const baseGET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leadId = params.id;

  try {
    // Verify lead belongs to org
    const lead = await prisma.leads.findFirst({
      where: {
        id: leadId,
        orgId,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Fetch timeline events
    const events = await prisma.leadPipelineEvent.findMany({
      where: {
        leadId,
        orgId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (err: any) {
    console.error("[Timeline API Error]:", err);
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
};

export const GET = compose(withSentryApi, withRateLimit, withOrgScope, safeAuth)(baseGET);
