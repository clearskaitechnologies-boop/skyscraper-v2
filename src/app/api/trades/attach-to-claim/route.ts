/**
 * POST /api/trades/attach-to-claim
 * Attach a trades connection client to a claim (new or existing)
 * Creates client portal access automatically
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { createClientContactFromTrades } from "@/lib/services/clientContactService";

const AttachToClaimSchema = z.object({
  connectionId: z.string().cuid(),
  claimId: z.string().cuid().optional(),
  createNewClaim: z
    .object({
      propertyAddress: z.string().min(1),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      carrierName: z.string().optional(),
      claimNumber: z.string().optional(),
      damageType: z.string().default("Other"),
      dateOfLoss: z.string(), // ISO date
      notes: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = AttachToClaimSchema.parse(body);

    // Fetch the connection with client details
    const connection = await prisma.clientProConnection.findUnique({
      where: { id: data.connectionId },
      include: {
        tradesCompany: true,
      },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // Fetch the contractor's org info separately via tradesCompanyMember
    const member = await prisma.tradesCompanyMember.findFirst({
      where: { companyId: connection.contractorId },
    });

    // Verify org ownership
    if (!member || member.orgId !== orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Ensure connection is accepted
    if (connection.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Connection must be accepted before attaching to claim" },
        { status: 400 }
      );
    }

    // Get or create CRM client contact from the Client relation
    const existingClient = await prisma.client.findUnique({
      where: { id: connection.clientId },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client information required to create client contact" },
        { status: 400 }
      );
    }

    const clientContact = await createClientContactFromTrades({
      orgId,
      connectionId: connection.id,
      clientName: existingClient.name || "Client",
      clientEmail: existingClient.email || `client-${connection.clientId}@temp.com`,
      clientPhone: existingClient.phone || undefined,
      clientAddress: existingClient.address || data.createNewClaim?.propertyAddress,
    });

    if (!clientContact) {
      return NextResponse.json({ error: "Failed to create client contact" }, { status: 500 });
    }

    let claim: any;

    // Handle claim attachment
    if (data.claimId) {
      // Attach to existing claim
      claim = await prisma.claims.findUnique({
        where: { id: data.claimId },
      });

      if (!claim) {
        return NextResponse.json({ error: "Claim not found" }, { status: 404 });
      }

      if (claim.orgId !== orgId) {
        return NextResponse.json({ error: "Unauthorized to access this claim" }, { status: 403 });
      }

      // Update claim with client
      await prisma.claims.update({
        where: { id: data.claimId },
        data: {
          clientId: clientContact.id,
          homeowner_email: clientContact.email,
        },
      });
    } else if (data.createNewClaim) {
      // Create new claim
      const newClaimData = data.createNewClaim;

      // Find or create property
      const property = await prisma.properties.create({
        data: {
          id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          street: newClaimData.propertyAddress,
          city: newClaimData.city || "",
          state: newClaimData.state || "",
          zipCode: newClaimData.zip || "",
          orgId,
          contactId: clientContact.id,
          name: newClaimData.propertyAddress,
          propertyType: "residential",
          updatedAt: new Date(),
        },
      });

      // Create claim
      claim = await prisma.claims.create({
        data: {
          id: `clm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          orgId,
          propertyId: property.id,
          clientId: clientContact.id,
          claimNumber: newClaimData.claimNumber || `CLM-${Date.now()}`,
          title: `${newClaimData.damageType} - ${newClaimData.propertyAddress}`,
          description: newClaimData.notes,
          damageType: newClaimData.damageType,
          dateOfLoss: new Date(newClaimData.dateOfLoss),
          carrier: newClaimData.carrierName,
          homeowner_email: clientContact.email,
          status: "new",
          updatedAt: new Date(),
        },
      });
    } else {
      return NextResponse.json(
        { error: "Must provide claimId or createNewClaim" },
        { status: 400 }
      );
    }

    // Note: ClientProConnection doesn't have a claimId field
    // The connection is linked via the clientId which is already set

    // Create client portal access
    const portalAccess = await prisma.client_access.create({
      data: {
        id: `access_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        email: clientContact.email || "",
        claimId: claim.id,
      },
    });

    // Create client notification about claim attachment
    try {
      await prisma.clientNotification.create({
        data: {
          clientId: clientContact.id,
          type: "claim_attached",
          title: "You've been added to a claim",
          message: `A contractor has attached you to claim ${claim.claimNumber || claim.title}. View your portal for details.`,
          actionUrl: `/portal/claims/${claim.id}`,
          metadata: { claimId: claim.id, claimNumber: claim.claimNumber },
        },
      });
    } catch (notifError) {
      console.error("[trades/attach-to-claim] ClientNotification create failed:", notifError);
    }

    return NextResponse.json({
      ok: true,
      claimId: claim.id,
      clientContactId: clientContact.id,
      clientPortalAccessId: portalAccess.id,
      portalUrl: `/portal/claims/${claim.id}`,
    });
  } catch (error: any) {
    console.error("Attach to claim error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
