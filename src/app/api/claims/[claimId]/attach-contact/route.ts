/**
 * POST /api/claims/[claimId]/attach-contact
 * Attach a contact/client to a claim via the clientId field
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { verifyProClaimAccess } from "@/lib/security";

export async function POST(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = await params;

    // Security: Verify Pro has access to this claim
    const hasAccess = await verifyProClaimAccess(userId, claimId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 });
    }

    // Verify the claim exists
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify the contact exists
    const contact = await prisma.contacts.findUnique({
      where: { id: contactId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Update the claim's clientId
    await prisma.claims.update({
      where: { id: claimId },
      data: {
        clientId: contactId,
        homeownerEmail: contact.email || undefined,
        homeowner_email: contact.email || undefined,
        insured_name:
          contact.firstName && contact.lastName
            ? `${contact.firstName} ${contact.lastName}`
            : contact.firstName || undefined,
        updatedAt: new Date(),
      },
    });

    // Also create a ClaimClientLink for tracking
    try {
      if (contact.email) {
        await prisma.claimClientLink.upsert({
          where: {
            claimId_clientEmail: {
              claimId,
              clientEmail: contact.email,
            },
          },
          update: {
            clientName: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
            status: "ACCEPTED",
          },
          create: {
            id: crypto.randomUUID(),
            claimId,
            clientEmail: contact.email,
            clientName: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
            clientUserId: "",
            status: "ACCEPTED",
            invitedBy: userId,
          },
        });
      }
    } catch {
      // Non-critical — don't fail the whole request
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to attach contact" }, { status: 500 });
  }
}
