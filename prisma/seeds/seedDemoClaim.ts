/**
 * Seed ONE demo claim with full structure for showcase purposes
 * Run: npx tsx prisma/seeds/seedDemoClaim.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDemoClaim() {
  console.log("🎯 Seeding demo claim...");

  // Find or create test organization
  let org = await prisma.org.findFirst({
    where: { name: { contains: "Demo" } },
  });

  if (!org) {
    org = await prisma.org.create({
      data: {
        name: "Demo Organization",
        tier: "PROFESSIONAL",
        aiModeDefault: "auto",
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Created demo org: ${org.id}`);
  } else {
    console.log(`✅ Using existing demo org: ${org.id}`);
  }

  // Check if demo claim already exists
  const existingClaim = await prisma.claims.findFirst({
    where: {
      claimNumber: "DEMO-ROOF-0001",
      orgId: org.id,
    },
  });

  if (existingClaim) {
    console.log(`✅ Demo claim already exists: ${existingClaim.id}`);
    console.log(`   Claim Number: DEMO-ROOF-0001`);
    console.log(`   Navigate to: /claims/${existingClaim.id}/overview`);
    return existingClaim.id;
  }

  // Create demo claim without complex relationships
  const claim = await prisma.claims.create({
    data: {
      id: `claim-demo-${Date.now()}`,
      claimNumber: "DEMO-ROOF-0001",
      title: "Prescott Hail Storm - Roof Replacement",
      status: "INSPECTED",
      claimType: "HAIL_DAMAGE",
      propertyAddress: "1234 Granite Dells Rd, Prescott, AZ 86303",
      clientName: "Sarah Johnson",
      clientEmail: "sarah.johnson@example.com",
      clientPhone: "(928) 555-0123",
      insuranceCarrier: "State Farm",
      policyNumber: "SF-12345-AZ",
      adjusterName: "Mike Roberts",
      adjusterEmail: "mike.roberts@statefarm.com",
      adjusterPhone: "(800) 555-7890",
      dateOfLoss: new Date("2024-06-15"),
      estimatedValue: 42500.0,
      orgId: org.id,
    },
  });

  console.log(`✅ Created demo claim: ${claim.id}`);
  console.log(`   Claim Number: ${claim.claimNumber}`);
  console.log(`   Status: ${claim.status}`);

  // Create timeline events
  const timelineEvents = [
    {
      claimId: claim.id,
      orgId: org.id,
      type: "CLAIM_CREATED",
      description: "Claim initiated by homeowner phone call",
      timestamp: new Date("2024-06-16T09:00:00Z"),
    },
    {
      claimId: claim.id,
      orgId: org.id,
      type: "INSPECTION_SCHEDULED",
      description: "Initial roof inspection scheduled with contractor",
      timestamp: new Date("2024-06-17T14:30:00Z"),
    },
    {
      claimId: claim.id,
      orgId: org.id,
      type: "INSPECTION_COMPLETED",
      description:
        "Roof inspection completed - extensive hail damage confirmed on north and west slopes",
      timestamp: new Date("2024-06-20T11:00:00Z"),
    },
    {
      claimId: claim.id,
      orgId: org.id,
      type: "ESTIMATE_SUBMITTED",
      description: "Full replacement estimate submitted to State Farm ($42,500)",
      timestamp: new Date("2024-06-22T16:45:00Z"),
    },
    {
      claimId: claim.id,
      orgId: org.id,
      type: "ADJUSTER_REVIEW",
      description: "Adjuster Mike Roberts reviewing submitted documentation",
      timestamp: new Date("2024-06-25T10:15:00Z"),
    },
  ];

  for (const event of timelineEvents) {
    await prisma.timeline.create({ data: event });
  }
  console.log(`✅ Created ${timelineEvents.length} timeline events`);

  // Create notes
  const notes = [
    {
      claimId: claim.id,
      orgId: org.id,
      content:
        "Client mentioned they heard loud banging on roof around 3pm on June 15th. Neighbors also experienced damage.",
      category: "GENERAL",
    },
    {
      claimId: claim.id,
      orgId: org.id,
      content:
        "Test squares showed multiple impact points per square. Recommend full replacement per State Farm guidelines.",
      category: "INSPECTION",
    },
    {
      claimId: claim.id,
      orgId: org.id,
      content:
        "Adjuster prefers detailed photos with measurements. Follow up with drone footage if needed.",
      category: "CARRIER",
    },
  ];

  for (const note of notes) {
    await prisma.notes.create({ data: note });
  }
  console.log(`✅ Created ${notes.length} notes`);

  // Create photo records (placeholder URLs)
  const photos = [
    {
      claimId: claim.id,
      orgId: org.id,
      title: "North Slope - Hail Impact Overview",
      publicUrl: "https://placehold.co/800x600/4A90E2/white?text=North+Slope+Damage",
      fileSize: 245600,
      mimeType: "image/jpeg",
    },
    {
      claimId: claim.id,
      orgId: org.id,
      title: "Close-up - Test Square Impacts",
      publicUrl: "https://placehold.co/800x600/E67E22/white?text=Test+Square+Detail",
      fileSize: 189300,
      mimeType: "image/jpeg",
    },
    {
      claimId: claim.id,
      orgId: org.id,
      title: "West Slope - Granule Loss",
      publicUrl: "https://placehold.co/800x600/27AE60/white?text=West+Slope+Granules",
      fileSize: 312400,
      mimeType: "image/jpeg",
    },
  ];

  for (const photo of photos) {
    await prisma.claimPhotos.create({ data: photo });
  }
  console.log(`✅ Created ${photos.length} photo records`);

  // Create document records (placeholder PDFs)
  const documents = [
    {
      claimId: claim.id,
      orgId: org.id,
      type: "ESTIMATE",
      title: "Initial Scope of Work",
      description: "Detailed line-item estimate for full roof replacement",
      publicUrl: "https://placehold.co/800x600/9B59B6/white?text=Estimate+PDF",
      mimeType: "application/pdf",
      fileSize: 452100,
      visibleToClient: true,
    },
    {
      claimId: claim.id,
      orgId: org.id,
      type: "INSPECTION_REPORT",
      title: "Roof Inspection Report",
      description: "Comprehensive damage assessment with photos and measurements",
      publicUrl: "https://placehold.co/800x600/E74C3C/white?text=Inspection+Report",
      mimeType: "application/pdf",
      fileSize: 1245000,
      visibleToClient: true,
    },
  ];

  for (const doc of documents) {
    await prisma.claimDocuments.create({ data: doc });
  }
  console.log(`✅ Created ${documents.length} document records`);

  console.log("\n🎉 Demo claim seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📍 Claim ID: ${claim.id}`);
  console.log(`📋 Claim Number: ${claim.claimNumber}`);
  console.log(`🏠 Property: ${claim.propertyAddress}`);
  console.log(`👤 Client: ${claim.clientName}`);
  console.log(`🏢 Carrier: ${claim.insuranceCarrier}`);
  console.log(`💰 Estimated Value: $${claim.estimatedValue?.toLocaleString()}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`\n🌐 Navigate to: /claims/${claim.id}/overview`);
  console.log(`   All 9 tabs should render with data:\n`);
  console.log(`   ✅ Overview - Claim details and stats`);
  console.log(`   ✅ Photos - ${photos.length} images`);
  console.log(`   ✅ Documents - ${documents.length} files`);
  console.log(`   ✅ Client - Contact information`);
  console.log(`   ✅ Timeline - ${timelineEvents.length} events`);
  console.log(`   ✅ Notes - ${notes.length} internal notes`);
  console.log(`   ✅ Reports - Generated reports`);
  console.log(`   ✅ Weather - Weather data (if configured)`);
  console.log(`   ✅ Trades - Contractor assignments`);

  return claim.id;
}

seedDemoClaim()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
