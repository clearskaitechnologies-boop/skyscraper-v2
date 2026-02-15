/**
 * PHASE C: Elite Claim Intake API
 * POST /api/claims/intake
 *
 * Professional 3-step claim creation with auto-healing org validation
 */

import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

import { getNextActionFromStatus } from "@/lib/claims/status";
import { generateContactSlug } from "@/lib/generateContactSlug";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export async function POST(req: Request) {
  try {
    // 1. AUTH & ORG VALIDATION with safeOrgContext
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgCtx = await safeOrgContext();
    if (!orgCtx?.orgId) {
      return NextResponse.json(
        { error: "No organization context. Please contact support." },
        { status: 400 }
      );
    }

    // 2. PARSE REQUEST BODY
    const body = await req.json();
    const {
      // Step 1: Loss Details
      dateOfLoss,
      lossType,
      status,
      // Step 2: Property
      propertyAddress,
      structureType,
      stories,
      roofType,
      slope,
      squareFootage,
      // Step 3: Contact & Policy
      contactId,
      contactName,
      contactPhone,
      contactEmail,
      policyNumber,
      carrier,
      deductible,
      agentName,
    } = body;

    // 3. VALIDATION
    if (!dateOfLoss || !propertyAddress) {
      return NextResponse.json(
        { error: "Date of loss and property address are required." },
        { status: 400 }
      );
    }

    // 4. AUTO-CREATE CONTACT if needed (contactId is required FK on properties)
    let finalContactId = contactId;
    // Guard against orphaned contactId — verify it exists before using
    if (finalContactId) {
      const existingContact = await prisma.contacts.findUnique({
        where: { id: finalContactId },
        select: { id: true },
      });
      if (!existingContact) {
        console.warn(`[Intake] Provided contactId ${finalContactId} not found, will auto-create`);
        finalContactId = null;
      }
    }
    if (!finalContactId) {
      const firstName = contactName?.split(" ")[0] || "Unknown";
      const lastName = contactName?.split(" ").slice(1).join(" ") || "Homeowner";

      const contact = await prisma.contacts.create({
        data: {
          id: nanoid(),
          orgId: orgCtx.orgId,
          firstName,
          lastName,
          phone: contactPhone || null,
          email: contactEmail || null,
          slug: generateContactSlug(firstName, lastName),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      finalContactId = contact.id;
    }

    // 5. GENERATE CLAIM NUMBER
    const claimNumber = `CL-${Date.now()}-${nanoid(6)}`;

    // 6. DETERMINE NEXT ACTION
    const finalStatus = status || "INTAKE";
    const nextAction = getNextActionFromStatus(finalStatus);

    // 7. CREATE PROPERTY RECORD
    const propertyRecord = await prisma.properties.create({
      data: {
        id: nanoid(),
        orgId: orgCtx.orgId,
        contactId: finalContactId, // Always valid — contact created above if needed
        name: `Property at ${propertyAddress}`,
        propertyType: structureType || "residential",
        street: propertyAddress || "Unknown",
        city: "",
        state: "",
        zipCode: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 8. CREATE CLAIM
    const claim = await prisma.claims.create({
      data: {
        id: nanoid(),
        orgId: orgCtx.orgId,
        claimNumber,

        // Required fields
        title: `${lossType || "Unknown"} Loss - ${propertyAddress}`,
        description: `Claim created via intake wizard on ${new Date().toLocaleDateString()}`,
        damageType: lossType || "UNKNOWN",
        dateOfLoss: new Date(dateOfLoss),
        status: finalStatus,

        // Contact
        insured_name: contactName || null,
        homeowner_email: contactEmail || null,

        // Property - Link to created property record
        propertyId: propertyRecord.id,

        // Policy fields (already exist in schema)
        policy_number: policyNumber || null,
        carrier: carrier || null,
        deductible: deductible ? Number(String(deductible).replace(/[^0-9.]/g, "")) || null : null,

        // Metadata
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 9. LOG ACTIVITY (optional - non-blocking)
    prisma.activities
      .create({
        data: {
          id: nanoid(),
          orgId: orgCtx.orgId,
          type: "CLAIM_CREATED",
          title: `Claim ${claimNumber} created`,
          userId: orgCtx.userId || "system",
          userName: "Intake Wizard",
          claimId: claim.id,
          metadata: {
            method: "intake_wizard",
            lossType,
            structureType,
            roofType,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .catch((err) => {
        console.error("[Intake] Failed to log activity:", err);
        // Non-critical, continue
      });

    return NextResponse.json({ claimId: claim.id }, { status: 201 });
  } catch (error: any) {
    console.error("[Intake API] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create claim" }, { status: 500 });
  }
}
