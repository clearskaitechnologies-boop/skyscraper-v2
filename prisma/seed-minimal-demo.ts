/**
 * Minimal Demo Seed Script - FK-Safe Edition
 *
 * Creates a clean, minimal demo environment with:
 * - 2 demo users (John & Jane Smith)
 * - 2 property profiles
 * - Associated jobs, claims, estimates, inspections, and appointments
 *
 * Properly handles foreign key constraints by deleting in the correct order:
 * 1. Gather all propertyIds for the org
 * 2. Delete dependent records by propertyId/projectId first
 * 3. Delete properties
 * 4. Delete contacts and templates
 *
 * Run: pnpm run seed:minimal-demo
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// CANONICAL DEMO ORG ID - must match src/lib/demo/constants.ts
const PUBLIC_DEMO_ORG_ID = "7dfd4537-ad63-4b32-b34f-6462061f0c6c";
const PUBLIC_DEMO_CLERK_ORG_ID = "public_demo";

async function main() {
  console.log("🚀 Starting Minimal Demo Seed (FK-Safe)...\n");

  // ==========================================
  // STEP 1: Find or Create Demo Organization
  // ==========================================
  console.log("📍 Step 1: Finding/Creating demo organization...");
  console.log(`   → Looking for org with ID: ${PUBLIC_DEMO_ORG_ID}`);

  // ALWAYS use the canonical demo org ID
  let demoOrg = await prisma.org.findUnique({
    where: { id: PUBLIC_DEMO_ORG_ID },
  });

  console.log(`   → findUnique by ID result: ${demoOrg ? demoOrg.id : "NOT FOUND"}`);

  if (!demoOrg) {
    // Try by clerkOrgId
    console.log(`   → Trying by clerkOrgId: ${PUBLIC_DEMO_CLERK_ORG_ID}`);
    demoOrg = await prisma.org.findUnique({
      where: { clerkOrgId: PUBLIC_DEMO_CLERK_ORG_ID },
    });
    console.log(`   → findUnique by clerkOrgId result: ${demoOrg ? demoOrg.id : "NOT FOUND"}`);
  }

  if (!demoOrg) {
    // Create the canonical demo org
    console.log("   → Creating canonical demo org...");
    demoOrg = await prisma.org.create({
      data: {
        id: PUBLIC_DEMO_ORG_ID,
        name: "Public Demo",
        clerkOrgId: PUBLIC_DEMO_CLERK_ORG_ID,
        planKey: "SOLO",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log(`   → Created demo org: ${demoOrg.id}`);
  }

  console.log(`✅ Using organization: ${demoOrg.name} (${demoOrg.id})\n`);

  // ==========================================
  // STEP 2: Clean Existing Demo Data (FK-SAFE)
  // ==========================================
  console.log("🧹 Step 2: Cleaning existing demo data (FK-safe order)...");

  // 2a. Gather all contact IDs for this org (we'll need this for properties)
  console.log("   → Gathering contact IDs...");
  const contacts = await prisma.contacts.findMany({
    where: { orgId: demoOrg.id },
    select: { id: true },
  });
  const contactIds = contacts.map((c) => c.id);
  console.log(`   → Found ${contactIds.length} contacts`);

  // 2b. Gather all property IDs for this org AND for these contacts
  console.log("   → Gathering property IDs...");
  const properties = await prisma.properties.findMany({
    where: {
      OR: [{ orgId: demoOrg.id }, { contactId: { in: contactIds } }],
    },
    select: { id: true },
  });
  const propertyIds = properties.map((p) => p.id);
  console.log(`   → Found ${propertyIds.length} properties to clean`);

  if (propertyIds.length > 0) {
    // 2c. Delete dependent records by propertyId/projectId FIRST
    console.log("   → Deleting dependent records by propertyId...");

    // Delete claims referencing these properties
    const deletedClaims = await prisma.claims.deleteMany({
      where: { propertyId: { in: propertyIds } },
    });
    console.log(`      ✓ Deleted ${deletedClaims.count} claims`);

    // Delete estimates referencing these properties/projects
    const deletedEstimates = await prisma.estimates.deleteMany({
      where: {
        projectId: { in: propertyIds },
      },
    });
    console.log(`      ✓ Deleted ${deletedEstimates.count} estimates`);

    // Delete jobs referencing these properties
    const deletedJobs = await prisma.jobs.deleteMany({
      where: { propertyId: { in: propertyIds } },
    });
    console.log(`      ✓ Deleted ${deletedJobs.count} jobs`);

    // Delete inspections referencing these properties
    const deletedInspections = await prisma.inspections.deleteMany({
      where: { propertyId: { in: propertyIds } },
    });
    console.log(`      ✓ Deleted ${deletedInspections.count} inspections`);

    // 2d. Now safe to delete properties themselves
    console.log("   → Deleting properties...");
    const deletedProperties = await prisma.properties.deleteMany({
      where: { id: { in: propertyIds } },
    });
    console.log(`      ✓ Deleted ${deletedProperties.count} properties`);
  }

  // 2e. Delete leads (they reference contacts)
  console.log("   → Deleting leads...");
  const deletedLeads = await prisma.leads.deleteMany({
    where: { orgId: demoOrg.id },
  });
  console.log(`      ✓ Deleted ${deletedLeads.count} leads`);

  // 2f. Finally safe to delete contacts
  console.log("   → Deleting contacts...");
  const deletedContacts = await prisma.contacts.deleteMany({
    where: { orgId: demoOrg.id },
  });
  console.log(`      ✓ Deleted ${deletedContacts.count} contacts`);

  console.log("✅ Cleanup complete!\n");

  // ==========================================
  // STEP 3: Create Demo Contacts (John & Jane Smith)
  // ==========================================
  console.log("👥 Step 3: Creating demo contacts...");

  const johnSmith = await prisma.contacts.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+1-555-0100",
      street: "123 Main Street",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
      slug: `john-smith-${Date.now()}`,
      updatedAt: new Date(),
      notes: "Primary homeowner - prefers email communication",
    },
  });
  console.log(`✅ Created contact: ${johnSmith.firstName} ${johnSmith.lastName} (${johnSmith.id})`);

  const janeSmith = await prisma.contacts.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      phone: "+1-555-0101",
      street: "4521 East Oak Avenue",
      city: "Scottsdale",
      state: "AZ",
      zipCode: "85251",
      slug: `jane-smith-${Date.now()}`,
      updatedAt: new Date(),
      notes:
        "Rental property owner - interested in roof replacement. Prefers phone calls over email. Budget approved up to $20,000.",
    },
  });
  console.log(`✅ Created contact: ${janeSmith.firstName} ${janeSmith.lastName} (${janeSmith.id})`);

  // Bob Smith - Lead (not yet a claim, just initial inquiry)
  const bobSmith = await prisma.contacts.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      firstName: "Bob",
      lastName: "Smith",
      email: "bob.smith@example.com",
      phone: "+1-555-0102",
      street: "789 Desert View Road",
      city: "Tempe",
      state: "AZ",
      zipCode: "85281",
      slug: `bob-smith-${Date.now()}`,
      updatedAt: new Date(),
      notes:
        "Initial inquiry via website contact form. Interested in roof inspection after recent storms. First-time homeowner.",
    },
  });
  console.log(`✅ Created contact: ${bobSmith.firstName} ${bobSmith.lastName} (${bobSmith.id})\n`);

  // ==========================================
  // STEP 4: Create Property Profiles
  // ==========================================
  console.log("🏠 Step 4: Creating property profiles...");

  const property1 = await prisma.properties.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      contactId: johnSmith.id,
      name: "John Smith Residence",
      propertyType: "residential",
      street: "123 Main Street",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85001",
      yearBuilt: 2010,
      squareFootage: 2400,
      roofType: "Asphalt Shingle",
      roofAge: 8,
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created property: ${property1.street} (${property1.id})`);

  const property2 = await prisma.properties.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      contactId: janeSmith.id,
      name: "Jane Smith Property",
      propertyType: "residential",
      street: "4521 East Oak Avenue",
      city: "Scottsdale",
      state: "AZ",
      zipCode: "85251",
      yearBuilt: 2005,
      squareFootage: 2200,
      roofType: "Tile",
      roofAge: 19,
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created property: ${property2.street} (${property2.id})`);

  const property3 = await prisma.properties.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      contactId: bobSmith.id,
      name: "Bob Smith Residence",
      propertyType: "residential",
      street: "789 Desert View Road",
      city: "Tempe",
      state: "AZ",
      zipCode: "85281",
      yearBuilt: 2018,
      squareFootage: 1800,
      roofType: "Asphalt Shingle",
      roofAge: 6,
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created property: ${property3.street} (${property3.id})\n`);

  // ==========================================
  // STEP 5: Create Jobs
  // ==========================================
  console.log("📋 Step 5: Creating jobs...");

  const job1 = await prisma.jobs.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      propertyId: property1.id,
      title: "Storm Damage Assessment",
      description: "Assess roof and siding damage from recent hailstorm",
      jobType: "inspection",
      status: "pending",
      priority: "high",
      scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created job: ${job1.title} (${job1.id})`);

  const job2 = await prisma.jobs.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      propertyId: property2.id,
      title: "Roof Inspection",
      description: "Annual roof inspection for rental property",
      jobType: "inspection",
      status: "completed",
      priority: "medium",
      scheduledStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      actualEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created job: ${job2.title} (${job2.id})\n`);

  // ==========================================
  // STEP 6: Create Claims
  // ==========================================
  console.log("📄 Step 6: Creating claims...");

  const claim1 = await prisma.claims.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      propertyId: property1.id,
      claimNumber: `DEMO-${Date.now()}-001`,
      title: "Hail Damage - Main Street Residence",
      damageType: "hail",
      status: "new",
      carrier: "State Farm",
      dateOfLoss: new Date("2026-01-15"),
      estimatedValue: 12500,
      description:
        "Hail damage to roof shingles and gutters. Multiple dents visible on metal components.",
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created claim: ${claim1.title} (${claim1.id})`);

  const claim2 = await prisma.claims.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      propertyId: property2.id,
      claimNumber: `DEMO-${Date.now()}-002`,
      title: "Wind Damage - Oak Avenue Property",
      damageType: "wind",
      status: "approved",
      carrier: "Allstate",
      dateOfLoss: new Date("2026-01-10"),
      estimatedValue: 8700,
      description:
        "Wind damage to roof tiles and minor fascia damage. Claim approved, awaiting contractor.",
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created claim: ${claim2.title} (${claim2.id})\n`);

  // ==========================================
  // STEP 6B: Create Leads for Pipeline & Job Center
  // ==========================================
  console.log("🔗 Step 6B: Creating leads for pipeline visibility...");

  // Lead 1: Insurance Claim (John Smith) - Shows in Pipeline under "Insurance Claims"
  const lead1 = await prisma.leads.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      contactId: johnSmith.id,
      claimId: claim1.id, // Link to the claim
      title: "John Smith - Hail Damage Claim",
      description:
        "Insurance claim for hail damage to roof shingles and gutters. Multiple areas of impact damage identified. State Farm policy holder, deductible $1,000.",
      source: "insurance_referral",
      value: 1250000, // $12,500.00 in cents
      stage: "new",
      temperature: "hot",
      jobCategory: "claim", // Shows in Insurance Claims category
      workType: "roof_repair",
      urgency: "high",
      probability: 90,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created lead: ${lead1.title} (Insurance) (${lead1.id})`);

  // Lead 2: Out of Pocket Job (Jane Smith) - Shows in Retail Workspace
  const lead2 = await prisma.leads.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      contactId: janeSmith.id,
      claimId: null, // No claim - this is retail/out of pocket
      title: "Jane Smith - Roof Replacement (Out of Pocket)",
      description:
        "Complete roof replacement for rental property. Customer paying out of pocket. Tile roof showing age-related wear, customer wants full replacement with upgraded materials.",
      source: "direct_inquiry",
      value: 1850000, // $18,500.00 in cents
      stage: "proposal",
      temperature: "hot",
      jobCategory: "out_of_pocket", // Shows as Out of Pocket category
      workType: "roof_replacement",
      urgency: "medium",
      budget: 2000000, // $20,000.00 budget
      probability: 85,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created lead: ${lead2.title} (Out of Pocket) (${lead2.id})`);

  // Lead 3: New Lead (Bob Smith) - Shows in Leads section / Pipeline
  const lead3 = await prisma.leads.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      contactId: bobSmith.id,
      claimId: null, // No claim yet - just a lead
      title: "Bob Smith - Storm Inspection Request",
      description:
        "First-time homeowner requesting inspection after recent storms. Noticed some granules in gutters. Concerned about potential hail damage. May become insurance claim if damage found.",
      source: "website",
      value: 0, // Unknown value until inspection
      stage: "new",
      temperature: "warm",
      jobCategory: "repair", // Potential repair job
      workType: "roof_inspection",
      urgency: "medium",
      probability: 50,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      notes: "Schedule inspection call. Check availability for this week.",
      updatedAt: new Date(),
    },
  });
  console.log(`✅ Created lead: ${lead3.title} (New Lead) (${lead3.id})\n`);

  // ==========================================
  // STEP 7: Create Estimates
  // ==========================================
  console.log("💰 Step 7: Creating estimates...");

  // Need to get a user ID for authorId
  const firstUser = await prisma.users.findFirst({ where: { orgId: demoOrg.id } });
  if (!firstUser) {
    console.log("⚠️  No users found - skipping estimates");
  } else {
    const estimate1 = await prisma.estimates.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        projectId: property1.id,
        authorId: firstUser.id,
        title: "Roof Repair - Hail Damage",
        description: "Replace damaged shingles and repair gutters",
        status: "DRAFT",
        total: 12500,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created estimate: ${estimate1.title} (${estimate1.id})`);

    const estimate2 = await prisma.estimates.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        projectId: property2.id,
        authorId: firstUser.id,
        title: "Tile Roof Repair - Wind Damage",
        description: "Replace broken tiles and repair fascia",
        status: "APPROVED",
        total: 8700,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created estimate: ${estimate2.title} (${estimate2.id})`);
  }
  console.log();

  // ==========================================
  // STEP 8: Create Inspections
  // ==========================================
  console.log("🔍 Step 8: Creating inspections...");

  if (!firstUser) {
    console.log("⚠️  No users found - skipping inspections\n");
  } else {
    const inspection1 = await prisma.inspections.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        propertyId: property1.id,
        inspectorId: firstUser.id,
        inspectorName: firstUser.name || "Inspector",
        title: "Hail Damage Assessment",
        type: "damage_assessment",
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        notes: "Initial damage assessment for hail claim",
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created inspection: ${inspection1.type} (${inspection1.id})`);

    const inspection2 = await prisma.inspections.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        propertyId: property2.id,
        inspectorId: firstUser.id,
        inspectorName: firstUser.name || "Inspector",
        title: "Final Inspection",
        type: "final_inspection",
        status: "completed",
        scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: "Final inspection completed. All repairs meet code requirements.",
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created inspection: ${inspection2.type} (${inspection2.id})`);
  }
  console.log();

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("=".repeat(60));
  console.log("🎉 MINIMAL DEMO SEED COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📊 Summary:");
  console.log(`   Organization: ${demoOrg.name}`);
  console.log(`   Contacts: 3 (John Smith, Jane Smith, Bob Smith)`);
  console.log(`   Properties: 3 (Phoenix, Scottsdale, Tempe)`);
  console.log(`   Jobs: 2 (1 pending, 1 completed)`);
  console.log(`   Claims: 2 (1 new, 1 approved)`);
  console.log(`   Leads: 3 (1 insurance claim, 1 out of pocket, 1 new lead)`);
  if (firstUser) {
    console.log(`   Estimates: 2 (1 draft, 1 approved)`);
    console.log(`   Inspections: 2 (1 scheduled, 1 completed)`);
  } else {
    console.log(`   Estimates: 0 (skipped - no users)`);
    console.log(`   Inspections: 0 (skipped - no users)`);
  }
  console.log("\n✅ Demo Data Guide:");
  console.log("   • John Smith - Insurance Claim (Pipeline → Insurance Claims)");
  console.log("   • Jane Smith - Out of Pocket (Retail Workspace → Out of Pocket)");
  console.log("   • Bob Smith - New Lead (Leads page / Pipeline → Repair Jobs)");
  console.log("\n✅ All foreign key constraints handled safely!");
  console.log("✅ Demo data is clean and repeatable!");
  console.log("\n💡 You can now run this script anytime to reset to minimal demo state.\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Error during seed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
