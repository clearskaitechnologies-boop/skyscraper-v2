/**
 * /api/claims/[claimId]/contractors
 *
 * Manage contractor assignments for a claim.
 * This enables PA firms to assign trades professionals from their network
 * to specific claims for restoration work.
 *
 * MIGRATION NOTE: This API uses claim_events for contractor assignments
 * since there's no dedicated claims_contractors table. Consider adding:
 *
 *   model ClaimContractor {
 *     id           String   @id @default(cuid())
 *     claimId      String
 *     companyId    String   @db.Uuid
 *     role         String   // "primary_contractor", "subcontractor", "consultant"
 *     status       String   @default("assigned") // assigned, accepted, in_progress, completed
 *     assignedAt   DateTime @default(now())
 *     acceptedAt   DateTime?
 *     completedAt  DateTime?
 *     notes        String?
 *
 *     claim   claims        @relation(fields: [claimId], references: [id])
 *     company tradesCompany @relation(fields: [companyId], references: [id])
 *
 *     @@unique([claimId, companyId])
 *   }
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { createTimelineEvent } from "@/lib/claims/timeline";
import { safeSendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";

/**
 * GET /api/claims/[claimId]/contractors
 * List contractors assigned to this claim
 */
export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Verify claim ownership
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get contractor assignments from claim_timeline_events
    const assignments = await prisma.claim_timeline_events.findMany({
      where: {
        claim_id: claimId,
        type: { in: ["contractor_assigned", "contractor_accepted", "contractor_completed"] },
      },
      orderBy: { occurred_at: "desc" },
    });

    // Get unique contractor IDs and their latest status
    const contractorMap = new Map<
      string,
      {
        companyId: string;
        status: string;
        assignedAt: Date;
        data: any;
      }
    >();

    for (const event of assignments) {
      const data = event.metadata as any;
      const companyId = data?.companyId;
      if (companyId && !contractorMap.has(companyId)) {
        contractorMap.set(companyId, {
          companyId,
          status:
            event.type === "contractor_completed"
              ? "completed"
              : event.type === "contractor_accepted"
                ? "in_progress"
                : "assigned",
          assignedAt: event.occurred_at,
          data,
        });
      }
    }

    // Fetch company details
    const companyIds = Array.from(contractorMap.keys());
    const companies =
      companyIds.length > 0
        ? await prisma.tradesCompany.findMany({
            where: { id: { in: companyIds } },
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              city: true,
              state: true,
              isVerified: true,
            },
          })
        : [];

    const companyLookup = new Map(companies.map((c) => [c.id, c]));

    const contractors = Array.from(contractorMap.entries()).map(([id, info]) => ({
      ...info,
      company: companyLookup.get(id) || null,
    }));

    return NextResponse.json({
      ok: true,
      contractors,
      count: contractors.length,
    });
  } catch (error) {
    logger.error("[Claims Contractors GET] Error:", error);
    return NextResponse.json({ error: "Failed to list contractors" }, { status: 500 });
  }
}

/**
 * POST /api/claims/[claimId]/contractors
 * Assign a contractor to this claim
 *
 * Body:
 *   companyId: string (tradesCompany.id)
 *   role?: "primary_contractor" | "subcontractor" | "consultant"
 *   notes?: string
 */
export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;
    const body = await request.json();
    const { companyId, role = "primary_contractor", notes } = body;

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // Verify claim ownership
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      include: { properties: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify company exists
    const company = await prisma.tradesCompany.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        email: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Contractor company not found" }, { status: 404 });
    }

    // Check if already assigned
    const existingAssignment = await prisma.claim_timeline_events.findFirst({
      where: {
        claim_id: claimId,
        type: "contractor_assigned",
        metadata: { path: ["companyId"], equals: companyId },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Contractor already assigned to this claim" },
        { status: 409 }
      );
    }

    // Get assigning user's info
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { name: true, email: true },
    });

    // Create assignment event
    const eventId = `evt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    await prisma.claim_timeline_events.create({
      data: {
        id: eventId,
        claim_id: claimId,
        type: "contractor_assigned",
        description: `${company.name} assigned as ${role.replace(/_/g, " ")}`,
        metadata: {
          companyId: company.id,
          companyName: company.name,
          companySlug: company.slug,
          role,
          notes,
          assignedBy: user?.name || userId,
          assignedByEmail: user?.email,
          assignedAt: new Date().toISOString(),
        },
        occurred_at: new Date(),
      },
    });

    // Create timeline event
    await createTimelineEvent({
      claimId,
      type: "contractor_assigned",
      title: `${company.name} Assigned`,
      body: `${company.name} has been assigned as ${role.replace(/_/g, " ")} for this claim.${notes ? ` Notes: ${notes}` : ""}`,
      visibleToClient: true,
      createdById: userId,
    });

    // Send notification email to contractor
    if (company.email) {
      try {
        await safeSendEmail({
          to: company.email,
          subject: `New Job Assignment - ${claim.claimNumber || claim.title}`,
          html: `
            <h2>You've Been Assigned a New Job</h2>
            <p>A public adjuster has assigned you to work on a claim.</p>
            
            <h3>Claim Details</h3>
            <ul>
              <li><strong>Claim Number:</strong> ${claim.claimNumber || "N/A"}</li>
              <li><strong>Property:</strong> ${claim.properties?.street || "Address on file"}</li>
              <li><strong>Damage Type:</strong> ${claim.damageType || "Not specified"}</li>
              <li><strong>Your Role:</strong> ${role.replace(/_/g, " ")}</li>
              ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ""}
            </ul>
            
            <p>Log in to your Trades Network dashboard to view the full details and accept this assignment.</p>
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/trades/jobs">View Your Jobs</a></p>
          `,
        });
      } catch (e) {
        logger.error("[Claims Contractors] Failed to send email:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      eventId,
      message: `${company.name} has been assigned to this claim`,
      contractor: {
        companyId: company.id,
        companyName: company.name,
        role,
        status: "assigned",
        assignedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("[Claims Contractors POST] Error:", error);
    return NextResponse.json({ error: "Failed to assign contractor" }, { status: 500 });
  }
}

/**
 * DELETE /api/claims/[claimId]/contractors
 * Remove a contractor assignment
 *
 * Query: companyId=xxx
 */
export async function DELETE(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // Verify claim ownership
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Get company name for logging
    const company = await prisma.tradesCompany.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    // Create unassignment event
    await prisma.claim_timeline_events.create({
      data: {
        id: `evt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        claim_id: claimId,
        type: "contractor_unassigned",
        description: `${company?.name || "Contractor"} removed from claim`,
        metadata: {
          companyId,
          companyName: company?.name,
          unassignedAt: new Date().toISOString(),
        },
        occurred_at: new Date(),
      },
    });

    // Create timeline event
    await createTimelineEvent({
      claimId,
      type: "contractor_unassigned",
      title: `${company?.name || "Contractor"} Removed`,
      body: `${company?.name || "A contractor"} has been removed from this claim.`,
      visibleToClient: false,
      createdById: userId,
    });

    return NextResponse.json({
      ok: true,
      message: "Contractor removed from claim",
    });
  } catch (error) {
    logger.error("[Claims Contractors DELETE] Error:", error);
    return NextResponse.json({ error: "Failed to remove contractor" }, { status: 500 });
  }
}
