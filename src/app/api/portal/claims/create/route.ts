import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateContactSlug } from "@/lib/generateContactSlug";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

const createClaimSchema = z.object({
  title: z.string().min(1, "title is required"),
  propertyAddress: z.string().min(1, "propertyAddress is required"),
  lossType: z.string().min(1, "lossType is required"),
  dateOfLoss: z.string().min(1, "dateOfLoss is required"),
  description: z.string().optional(),
  carrier: z.string().optional(),
  policyNumber: z.string().optional(),
  homeownerName: z.string().optional(),
  homeownerPhone: z.string().optional(),
  email: z.string().optional(),
  homeownerEmail: z.string().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ctx = await safeOrgContext();

    if (ctx.status !== "ok") {
      return NextResponse.json({ error: "Organization context required" }, { status: 403 });
    }

    const raw = await req.json();
    const parsed = createClaimSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data;
    const { title, propertyAddress, lossType, dateOfLoss, description, carrier, policyNumber } =
      body;

    // Generate claim number
    const claimCount = await prisma.claims.count({
      where: { orgId: ctx.orgId! },
    });
    const claimNumber = `CLM-${Date.now()}-${(claimCount + 1).toString().padStart(4, "0")}`;

    // Create contact for the homeowner (contactId FK is required on properties)
    const contactId = nanoid();
    await prisma.contacts.create({
      data: {
        id: contactId,
        orgId: ctx.orgId!,
        firstName: body.homeownerName?.split(" ")[0] || "Portal",
        lastName: body.homeownerName?.split(" ").slice(1).join(" ") || "Homeowner",
        slug: generateContactSlug(
          body.homeownerName?.split(" ")[0] || "Portal",
          body.homeownerName?.split(" ").slice(1).join(" ") || "Homeowner"
        ),
        phone: body.homeownerPhone || null,
        email: body.email || body.homeownerEmail || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create property first since claim needs propertyId
    const propertyId = nanoid();
    await prisma.properties.create({
      data: {
        id: propertyId,
        orgId: ctx.orgId!,
        contactId, // Real contact FK
        name: title,
        propertyType: "residential",
        street: propertyAddress || "",
        city: "",
        state: "",
        zipCode: "",
        updatedAt: new Date(),
      },
    });

    // Create the claim
    const claim = await prisma.claims.create({
      data: {
        id: nanoid(),
        title,
        claimNumber,
        description: description || null,
        dateOfLoss: new Date(dateOfLoss),
        status: "pending",
        orgId: ctx.orgId!,
        propertyId,
        damageType: lossType || "Other",
        carrier: carrier || null,
        policy_number: policyNumber || null,
        updatedAt: new Date(),
      },
    });

    // Create client portal access for this claim
    await prisma.client_access.create({
      data: {
        id: nanoid(),
        claimId: claim.id,
        email: body.email || `homeowner-${claim.id}@placeholder.com`,
      },
    });

    // Create initial timeline event
    await prisma.claim_timeline_events.create({
      data: {
        id: nanoid(),
        claim_id: claim.id,
        type: "claim_created",
        description: "Claim created",
        actor_id: userId,
      },
    });

    // AUTOMATIC LEAD MATCHING - Find matching contractors
    try {
      // Extract ZIP from property address (last 5 digits)
      const zipMatch = propertyAddress.match(/\b\d{5}\b/);
      const zip = zipMatch ? zipMatch[0] : null;

      // Map loss type to trade type
      const lossTypeToTrade: Record<string, string> = {
        Water: "Plumbing",
        Fire: "General Contracting",
        Storm: "Roofing",
        Wind: "Roofing",
        Hail: "Roofing",
        Theft: "General Contracting",
        Vandalism: "General Contracting",
        Other: "General Contracting",
      };

      const tradeType = lossTypeToTrade[lossType] || "General Contracting";

      if (zip) {
        // TODO: Lead matching - trades models not yet implemented
        console.log(
          `[LEAD_MATCH] Would match contractors for claim ${claim.claimNumber} - ZIP: ${zip}, Trade: ${tradeType}`
        );
      }
    } catch (matchError) {
      console.error("[LEAD_MATCH_ERROR]", matchError);
      // Don't fail the claim creation if lead matching fails
    }

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        title: claim.title,
      },
    });
  } catch (error) {
    console.error("[CREATE_CLAIM_ERROR]", error);
    return NextResponse.json({ error: "Failed to create claim" }, { status: 500 });
  }
}
