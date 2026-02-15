import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    if (!orgId) {
      return NextResponse.json({ error: "Organization required." }, { status: 400 });
    }

    const claimId = params.claimId;

    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    // Fetch claim with all related data
    const claim = await prisma.claims
      .findUnique({
        where: { id: claimId },
        select: {
          id: true,
          claimNumber: true,
          title: true,
          description: true,
          status: true,
          damageType: true,
          dateOfLoss: true,
          carrier: true,
          policy_number: true,
          propertyId: true,
          clientId: true,
        },
      })
      .catch(() => null);

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Fetch property details if exists
    const property = claim.propertyId
      ? await prisma.properties
          .findUnique({
            where: { id: claim.propertyId },
            select: {
              street: true,
              city: true,
              state: true,
              zipCode: true,
            },
          })
          .catch(() => null)
      : null;

    // Fetch client link if exists
    const clientLink = await prisma.claimClientLink
      .findFirst({
        where: { claimId: claim.id },
        select: {
          clientEmail: true,
          clientName: true,
          status: true,
        },
      })
      .catch(() => null);

    // Count activities (proxy for photos/documents)
    const activitiesCount = await prisma.claim_activities
      .count({
        where: { claim_id: claim.id },
      })
      .catch(() => 0);

    // Count documents from reports
    const documentsCount = await prisma.reports
      .count({
        where: { claimId: claim.id },
      })
      .catch(() => 0);

    // Fetch recent timeline events (last 10)
    const timeline = await prisma.claim_timeline_events
      .findMany({
        where: { claim_id: claim.id },
        select: {
          id: true,
          type: true,
          description: true,
          occurred_at: true,
        },
        orderBy: { occurred_at: "desc" },
        take: 10,
      })
      .catch(() => []);

    // Build context response
    const context = {
      id: claim.id,
      claimNumber: claim.claimNumber,
      title: claim.title,
      description: claim.description,
      status: claim.status,
      damageType: claim.damageType,
      dateOfLoss: claim.dateOfLoss,
      address: property
        ? `${property.street}, ${property.city}, ${property.state} ${property.zipCode}`
        : null,
      client: clientLink
        ? {
            clientEmail: clientLink.clientEmail,
            clientName: clientLink.clientName,
            status: clientLink.status,
          }
        : null,
      insurance: {
        carrier: claim.carrier,
        policyNumber: claim.policy_number,
      },
      activitiesCount,
      documentsCount,
      timeline,
    };

    return NextResponse.json(context);
  } catch (error) {
    console.error("Error fetching claim context:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
