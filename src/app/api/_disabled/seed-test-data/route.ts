import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { generateContactSlug } from "@/lib/generateContactSlug";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedOrgId = orgId || userId;

    // Create a test contact first
    const contact = await prisma.contacts.create({
      data: {
        id: crypto.randomUUID(),
        orgId: resolvedOrgId,
        firstName: "John",
        lastName: "Homeowner",
        slug: generateContactSlug("John", "Homeowner"),
        email: "john@example.com",
        phone: "555-0123",
        street: "123 Main Street",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        updatedAt: new Date(),
      },
    });

    // Create a test property
    const property = await prisma.properties.create({
      data: {
        id: crypto.randomUUID(),
        orgId: resolvedOrgId,
        contactId: contact.id,
        name: "Main Residence",
        propertyType: "Single Family Home",
        street: "123 Main Street",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        yearBuilt: 2010,
        squareFootage: 2500,
        roofType: "Asphalt Shingle",
        roofAge: 10,
        updatedAt: new Date(),
      },
    });

    // Create test claims
    const claim1 = await prisma.claims.create({
      data: {
        id: crypto.randomUUID(),
        orgId: resolvedOrgId,
        propertyId: property.id,
        claimNumber: `CLM-${Date.now()}`,
        title: "Hail Damage Claim",
        description: "Roof damage from recent hail storm",
        status: "open",
        damageType: "HAIL",
        dateOfLoss: new Date("2025-10-15"),
        insured_name: "John Homeowner",
        carrier: "State Farm",
        policy_number: "POL-123456",
        lifecycle_stage: "FILED",
        exposure_cents: 1500000, // $15,000
        updatedAt: new Date(),
      },
    });

    const claim2 = await prisma.claims.create({
      data: {
        id: crypto.randomUUID(),
        orgId: resolvedOrgId,
        propertyId: property.id,
        claimNumber: `CLM-${Date.now() + 1}`,
        title: "Wind Damage Claim",
        description: "Shingle loss from windstorm",
        status: "open",
        damageType: "WIND",
        dateOfLoss: new Date("2025-11-01"),
        insured_name: "John Homeowner",
        carrier: "Allstate",
        policy_number: "POL-789012",
        lifecycle_stage: "ADJUSTER_REVIEW",
        exposure_cents: 850000, // $8,500
        updatedAt: new Date(),
      },
    });

    // Create test leads
    const lead1 = await prisma.leads.create({
      data: {
        id: crypto.randomUUID(),
        orgId: resolvedOrgId,
        contactId: contact.id,
        title: "Roof Inspection Request",
        description: "Homeowner noticed missing shingles",
        source: "Website",
        stage: "new",
        temperature: "hot",
        value: 5000,
        updatedAt: new Date(),
      },
    });

    const lead2 = await prisma.leads.create({
      data: {
        id: crypto.randomUUID(),
        orgId: resolvedOrgId,
        contactId: contact.id,
        title: "Storm Damage Assessment",
        description: "Recent storm, needs full inspection",
        source: "Referral",
        stage: "contacted",
        temperature: "warm",
        value: 12000,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      created: {
        contact: contact.id,
        property: property.id,
        claims: [claim1.id, claim2.id],
        leads: [lead1.id, lead2.id],
      },
      description: "Test data created successfully! Refresh your pages to see the data.",
    });
  } catch (error: any) {
    console.error("[Seed Data] Error:", error);
    return NextResponse.json(
      { error: "Failed to create seed data", details: error.message },
      { status: 500 }
    );
  }
}
