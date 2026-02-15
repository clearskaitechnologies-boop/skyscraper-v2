import { NextResponse } from "next/server";

import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

function buildIds(orgId: string) {
  const short = orgId.slice(0, 8);
  return {
    contactJohn: `demo-contact-john-${short}`,
    contactJane: `demo-contact-jane-${short}`,
    contactBob: `demo-contact-bob-${short}`,
    propertyJohn: `demo-property-john-${short}`,
    propertyJane: `demo-property-jane-${short}`,
    claimJohn: `demo-claim-john-${short}`,
    claimNumber: `DEMO-${short}-001`,
    leadJane: `demo-lead-jane-${short}`,
    leadBob: `demo-lead-bob-${short}`,
    templateSlug: "initial-claim-inspection",
  };
}

export async function POST() {
  const { userId, orgId, role } = await getCurrentUserPermissions();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  if (!orgId) {
    return NextResponse.json(
      { error: "Organization not found. Please repair your account first." },
      { status: 400 }
    );
  }

  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { demoMode: true, demoSeededAt: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Check if demo data actually exists (in case it was cleared)
  const ids = buildIds(orgId);
  const existingDemoData = await prisma.claims.findUnique({
    where: { id: ids.claimJohn },
    select: { id: true },
  });

  // Skip only if demoSeededAt is set AND data actually exists
  if (org.demoSeededAt && existingDemoData) {
    return NextResponse.json({
      ok: true,
      seeded: false,
      demoMode: true,
      demoSeededAt: org.demoSeededAt?.toISOString() ?? null,
    });
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.contacts.upsert({
      where: { id: ids.contactJohn },
      update: {},
      create: {
        id: ids.contactJohn,
        orgId,
        isDemo: true,
        slug: `john-smith-${ids.contactJohn}`,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "(555) 123-4567",
        street: "123 Main Street",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        source: "demo",
        notes: "Demo contact for insurance claim",
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.contacts.upsert({
      where: { id: ids.contactJane },
      update: {},
      create: {
        id: ids.contactJane,
        orgId,
        isDemo: true,
        slug: `jane-smith-${ids.contactJane}`,
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "(555) 234-5678",
        street: "456 Retail Lane",
        city: "Scottsdale",
        state: "AZ",
        zipCode: "85251",
        source: "referral",
        notes: "Retail roof repair demo lead",
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.contacts.upsert({
      where: { id: ids.contactBob },
      update: {},
      create: {
        id: ids.contactBob,
        orgId,
        isDemo: true,
        slug: `bob-smith-${ids.contactBob}`,
        firstName: "Bob",
        lastName: "Smith",
        email: "bob.smith@example.com",
        phone: "(555) 345-6789",
        street: "789 Repair Road",
        city: "Tempe",
        state: "AZ",
        zipCode: "85281",
        source: "website",
        notes: "Repair job demo lead",
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.properties.upsert({
      where: { id: ids.propertyJohn },
      update: {},
      create: {
        id: ids.propertyJohn,
        orgId,
        isDemo: true,
        contactId: ids.contactJohn,
        name: "John Smith Residence",
        propertyType: "Residential",
        street: "123 Main Street",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        yearBuilt: 2012,
        squareFootage: 2300,
        roofType: "Composition Shingle",
        roofAge: 8,
        carrier: "State Farm",
        policyNumber: "SF-DEMO-001",
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.properties.upsert({
      where: { id: ids.propertyJane },
      update: {},
      create: {
        id: ids.propertyJane,
        orgId,
        isDemo: true,
        contactId: ids.contactJane,
        name: "Jane Smith Residence",
        propertyType: "Residential",
        street: "456 Retail Lane",
        city: "Scottsdale",
        state: "AZ",
        zipCode: "85251",
        yearBuilt: 2018,
        squareFootage: 1800,
        roofType: "Tile",
        roofAge: 5,
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.claims.upsert({
      where: { id: ids.claimJohn },
      update: {},
      create: {
        id: ids.claimJohn,
        orgId,
        isDemo: true,
        propertyId: ids.propertyJohn,
        claimNumber: ids.claimNumber,
        title: "John Smith Hail Damage Claim",
        description: "Demo claim for hail damage. Adjuster-ready workflow.",
        damageType: "HAIL",
        dateOfLoss: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
        status: "new",
        priority: "high",
        carrier: "State Farm",
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.leads.upsert({
      where: { id: ids.leadJane },
      update: {},
      create: {
        id: ids.leadJane,
        orgId,
        isDemo: true,
        contactId: ids.contactJane,
        title: "Jane Smith - Retail Roof Repair",
        description: "Out-of-pocket retail roof repair request.",
        source: "referral",
        stage: "new",
        temperature: "warm",
        jobCategory: "out_of_pocket",
        jobType: "RETAIL",
        value: 850000,
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.leads.upsert({
      where: { id: ids.leadBob },
      update: {},
      create: {
        id: ids.leadBob,
        orgId,
        isDemo: true,
        contactId: ids.contactBob,
        title: "Bob Smith - Repair Job",
        description: "Repair job lead for demo pipeline view.",
        source: "website",
        stage: "new",
        temperature: "warm",
        jobCategory: "repair",
        jobType: "REPAIR",
        value: 1250000,
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        createdAt: now,
        updatedAt: now,
      },
    });

    const mandatoryTemplate = await tx.template.upsert({
      where: { slug: ids.templateSlug },
      update: { isPublished: true, isActive: true },
      create: {
        slug: ids.templateSlug,
        name: "Initial Claim Inspection",
        description:
          "First response inspection report documenting initial damage findings and emergency mitigation.",
        category: "Inspections",
        version: "1.0",
        isPublished: true,
        isActive: true,
        isMarketplace: true,
        tags: ["initial", "claim", "inspection", "mandatory"],
        previewPdfUrl: "/docs/QuickReport.pdf",
      } as any,
    });

    await tx.orgTemplate.upsert({
      where: { orgId_templateId: { orgId, templateId: mandatoryTemplate.id } },
      update: { isActive: true },
      create: { orgId, templateId: mandatoryTemplate.id, isActive: true },
    });

    await tx.org.update({
      where: { id: orgId },
      data: { demoMode: true, demoSeededAt: now },
    });
  });

  return NextResponse.json({
    ok: true,
    seeded: true,
    demoMode: true,
    demoSeededAt: now.toISOString(),
  });
}
