/**
 * Arizona Storm Demo Generator v2
 * Complete pre-populated demo environment showcasing Collaboration Framework v1.7
 *
 * Creates:
 * - Demo organization with Arizona Storm branding
 * - 2 Pro users (Damien, Dowe)
 * - 3 Clients with full contact info
 * - 3 Properties in Prescott, AZ
 * - 3 Claims at different lifecycle stages
 * - Files with client feedback threads
 * - Timeline events showing progression
 * - Trade partner network with assignments
 * - Notifications covering all categories
 * - Portal access tokens for clients
 *
 * Run: DEMO_MODE=true pnpm prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  // ── Safety: never run seed-demo against production ──
  if (process.env.NODE_ENV === "production" && !process.env.DEMO_MODE) {
    console.error("❌  seed-demo.ts is blocked in production. Set DEMO_MODE=true to override.");
    process.exit(1);
  }

  console.log("🌩️  Arizona Storm Demo Generator v2 Starting...\n");

  // Clean existing demo data
  console.log("🧹 Cleaning existing demo data...");

  // Find existing demo org
  const existingOrg = await prisma.org.findFirst({
    where: { name: "Arizona Storm Demo" },
  });

  if (existingOrg) {
    console.log("   Found existing demo org, cleaning...");

    // Delete in reverse dependency order
    await prisma.projectNotification.deleteMany({ where: { orgId: existingOrg.id } });
    await prisma.claimFileComment.deleteMany({
      where: { claim: { orgId: existingOrg.id } },
    });
    await prisma.claimTradePartner.deleteMany({
      where: { claim: { orgId: existingOrg.id } },
    });
    await prisma.tradePartner.deleteMany({ where: { orgId: existingOrg.id } });
    await prisma.claimTimelineEvent.deleteMany({
      where: { claim: { orgId: existingOrg.id } },
    });
    await prisma.claim_documents.deleteMany({
      where: { claim: { orgId: existingOrg.id } },
    });
    await prisma.messageThread.deleteMany({
      where: { claim: { orgId: existingOrg.id } },
    });
    await prisma.claims.deleteMany({ where: { orgId: existingOrg.id } });
    await prisma.clientPortalAccess.deleteMany({
      where: { client: { orgId: existingOrg.id } },
    });
    await prisma.client.deleteMany({ where: { orgId: existingOrg.id } });
    await prisma.property.deleteMany({ where: { orgId: existingOrg.id } });
    await prisma.contact.deleteMany({ where: { orgId: existingOrg.id } });
    await prisma.org.delete({ where: { id: existingOrg.id } });

    console.log("   ✅ Cleanup complete\n");
  } else {
    console.log("   No existing demo org found\n");
  }

  // Create Demo Organization
  console.log("🏢 Creating Arizona Storm Demo organization...");
  const demoOrg = await prisma.org.create({
    data: {
      id: randomUUID(),
      name: "Arizona Storm Demo",
      clerkOrgId: "org_demo_arizona_storm",
      updatedAt: new Date(),
      subscriptionStatus: "active",
      planKey: "pro",
      videoEnabled: true,
      aiModeDefault: "auto",
    },
  });
  console.log(`✅ Organization created: ${demoOrg.name} (ID: ${demoOrg.id})\n`);

  // Create Pro Users
  console.log("👥 Creating pro users...");

  const damien = await prisma.users.create({
    data: {
      id: randomUUID(),
      clerkUserId: "user_demo_damien",
      email: "damien@arizonastorm.demo",
      name: "Damien Storm",
      orgId: demoOrg.id,
      role: "ADMIN",
      title: "Owner & CEO",
      phone: "+1-928-555-0101",
      years_experience: 15,
      bio: "Founder of Arizona Storm Demo, specializing in storm damage restoration",
    },
  });

  const dowe = await prisma.users.create({
    data: {
      id: randomUUID(),
      clerkUserId: "user_demo_dowe",
      email: "dowe@arizonastorm.demo",
      name: "Dowe Martinez",
      orgId: demoOrg.id,
      role: "USER",
      title: "Lead Estimator",
      phone: "+1-928-555-0102",
      years_experience: 8,
      bio: "Expert estimator with focus on accurate damage assessment",
    },
  });

  console.log(`✅ Created ${damien.name} (admin)`);
  console.log(`✅ Created ${dowe.name} (estimator)\n`);

  // Create Contacts (for property linkage)
  console.log("📇 Creating contacts...");

  const contactSarah = await prisma.contacts.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      first_name: "Sarah",
      last_name: "Johnson",
      email: "sarah.johnson@demo.com",
      phone: "+1-928-555-1001",
      updatedAt: new Date(),
      notes: "Excellent communication, very responsive to portal updates",
    },
  });

  const contactMike = await prisma.contacts.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      first_name: "Mike",
      last_name: "Peterson",
      email: "mike.peterson@demo.com",
      phone: "+1-928-555-1002",
      updatedAt: new Date(),
      notes: "First-time customer, asked many questions about process",
    },
  });

  const contactEmily = await prisma.contacts.create({
    data: {
      id: randomUUID(),
      orgId: demoOrg.id,
      first_name: "Emily",
      last_name: "Rodriguez",
      email: "emily.rodriguez@demo.com",
      phone: "+1-928-555-1003",
      updatedAt: new Date(),
      notes: "Referred by Sarah Johnson, seeking quick turnaround",
    },
  });

  console.log(`✅ Created ${contactSarah.first_name} ${contactSarah.last_name}`);
  console.log(`✅ Created ${contactMike.first_name} ${contactMike.last_name}`);
  console.log(`✅ Created ${contactEmily.first_name} ${contactEmily.last_name}\n`);

  // Create Clients (for claims linkage)
  console.log("🏠 Creating clients...");

  const sarah = await prisma.client.create({
    data: {
      orgId: demoOrg.id,
      name: "Sarah Johnson",
      email: "sarah.johnson@demo.com",
      phone: "+1-928-555-1001",
      notes: "Excellent communication, very responsive to portal updates",
    },
  });

  const mike = await prisma.client.create({
    data: {
      orgId: demoOrg.id,
      name: "Mike Peterson",
      email: "mike.peterson@demo.com",
      phone: "+1-928-555-1002",
      notes: "First-time customer, asked many questions about process",
    },
  });

  const emily = await prisma.client.create({
    data: {
      orgId: demoOrg.id,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@demo.com",
      phone: "+1-928-555-1003",
      notes: "Referred by Sarah Johnson, seeking quick turnaround",
    },
  });

  console.log(`✅ Created client ${sarah.name}`);
  console.log(`✅ Created client ${mike.name}`);
  console.log(`✅ Created client ${emily.name}\n`);

  // Create Properties
  console.log("🏘️  Creating properties...");

  const property1 = await prisma.property.create({
    data: {
      orgId: demoOrg.id,
      address: "2458 Mountain View Drive",
      city: "Prescott",
      state: "AZ",
      zipCode: "86301",
      propertyType: "residential",
      roofType: "shingle",
      roofAge: 12,
      squareFeet: 2400,
      stories: 2,
      notes: "Corner lot with mountain views, composite shingles installed 2013",
    },
  });

  const property2 = await prisma.property.create({
    data: {
      orgId: demoOrg.id,
      address: "1876 Pine Ridge Road",
      city: "Prescott Valley",
      state: "AZ",
      zipCode: "86314",
      propertyType: "residential",
      roofType: "tile",
      roofAge: 8,
      squareFeet: 2800,
      stories: 1,
      notes: "Clay tile roof, detached garage with separate roof section",
    },
  });

  const property3 = await prisma.property.create({
    data: {
      orgId: demoOrg.id,
      address: "3421 Canyon Creek Lane",
      city: "Prescott",
      state: "AZ",
      zipCode: "86305",
      propertyType: "residential",
      roofType: "shingle",
      roofAge: 15,
      squareFeet: 2200,
      stories: 1,
      notes: "Ranch style home, original roof from 2010",
    },
  });

  console.log(`✅ ${property1.address}, ${property1.city}`);
  console.log(`✅ ${property2.address}, ${property2.city}`);
  console.log(`✅ ${property3.address}, ${property3.city}\n`);

  // Create Claims with Full Lifecycle
  console.log("📋 Creating claims with lifecycle data...");

  // Claim 1: Sarah - Hail Damage (APPROVED/PRODUCTION)
  const claim1 = await prisma.claims.create({
    data: {
      orgId: demoOrg.id,
      propertyId: property1.id,
      clientId: sarah.id,
      claimNumber: "AZ-2025-001",
      status: "approved",
      lifecycle_stage: "production",
      lossType: "hail",
      lossDate: new Date("2025-01-15"),
      dateReceived: new Date("2025-01-16"),
      dateOfInspection: new Date("2025-01-20"),
      insuranceCarrier: "State Farm",
      policyNumber: "SF-12345678",
      estimatedAmount: 26200,
      approvedAmount: 26200,
      deductible: 1000,
      claimStatus: "open",
      priority: "high",
      adjusterName: "Tom Williams",
      adjusterPhone: "+1-800-555-1234",
      adjusterEmail: "tom.williams@statefarm.com",
      scopeOfWork: "Complete roof replacement - hail damage to shingles, ridge caps, and gutters",
      notes: "Customer approved estimate, production scheduled for early February",
    },
  });

  // Claim 2: Mike - Wind Damage (ESTIMATE SENT)
  const claim2 = await prisma.claims.create({
    data: {
      orgId: demoOrg.id,
      propertyId: property2.id,
      clientId: mike.id,
      claimNumber: "AZ-2025-002",
      status: "pending",
      lifecycle_stage: "estimate_sent",
      lossType: "wind",
      lossDate: new Date("2025-01-22"),
      dateReceived: new Date("2025-01-23"),
      dateOfInspection: new Date("2025-01-25"),
      insuranceCarrier: "Farmers Insurance",
      policyNumber: "FM-87654321",
      estimatedAmount: 15800,
      deductible: 2500,
      claimStatus: "open",
      priority: "medium",
      adjusterName: "Lisa Chen",
      adjusterPhone: "+1-800-555-5678",
      adjusterEmail: "lisa.chen@farmersinsurance.com",
      scopeOfWork: "Repair wind-damaged tiles, replace broken sections, re-secure loose tiles",
      notes: "Estimate sent to customer and insurance adjuster, awaiting approval",
    },
  });

  // Claim 3: Emily - Hail + Wind (INSPECTION)
  const claim3 = await prisma.claims.create({
    data: {
      orgId: demoOrg.id,
      propertyId: property3.id,
      clientId: emily.id,
      claimNumber: "AZ-2025-003",
      status: "inspection",
      lifecycle_stage: "inspection",
      lossType: "hail",
      lossDate: new Date("2025-01-28"),
      dateReceived: new Date("2025-01-29"),
      dateOfInspection: new Date("2025-02-01"),
      insuranceCarrier: "Allstate",
      policyNumber: "AS-11223344",
      estimatedAmount: 22000,
      deductible: 1500,
      claimStatus: "open",
      priority: "medium",
      adjusterName: "Robert Martinez",
      adjusterPhone: "+1-800-555-9012",
      adjusterEmail: "robert.martinez@allstate.com",
      scopeOfWork: "TBD - inspection scheduled for February 1st",
      notes: "Recent storm damage, inspection scheduled this week",
    },
  });

  console.log(
    `✅ Claim ${claim1.claimNumber} - ${claim1.lossType?.toUpperCase()} - ${claim1.lifecycle_stage}`
  );
  console.log(
    `✅ Claim ${claim2.claimNumber} - ${claim2.lossType?.toUpperCase()} - ${claim2.lifecycle_stage}`
  );
  console.log(
    `✅ Claim ${claim3.claimNumber} - ${claim3.lossType?.toUpperCase()} - ${claim3.lifecycle_stage}\n`
  );

  // Create Files with Client Visibility
  console.log("📁 Creating claim files...");

  const file1 = await prisma.claim_documents.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      fileName: "hail-damage-estimate.pdf",
      fileType: "estimate",
      fileSize: 245000,
      fileUrl: "https://demo-storage.example.com/estimates/az-2025-001-estimate.pdf",
      uploadedBy: damien.clerkUserId!,
      visibleToClient: true,
      description: "Complete estimate for hail damage repair",
    },
  });

  const file2 = await prisma.claim_documents.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      fileName: "roof-inspection-photos.zip",
      fileType: "photos",
      fileSize: 8500000,
      fileUrl: "https://demo-storage.example.com/photos/az-2025-001-photos.zip",
      uploadedBy: dowe.clerkUserId!,
      visibleToClient: true,
      description: "Comprehensive roof inspection photos showing hail damage",
    },
  });

  const file3 = await prisma.claim_documents.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      fileName: "scope-of-work.pdf",
      fileType: "scope",
      fileSize: 128000,
      fileUrl: "https://demo-storage.example.com/scope/az-2025-001-scope.pdf",
      uploadedBy: damien.clerkUserId!,
      visibleToClient: true,
      description: "Detailed scope of work for roof replacement",
    },
  });

  const file4 = await prisma.claim_documents.create({
    data: {
      claimId: claim2.id,
      orgId: demoOrg.id,
      fileName: "wind-damage-estimate.pdf",
      fileType: "estimate",
      fileSize: 189000,
      fileUrl: "https://demo-storage.example.com/estimates/az-2025-002-estimate.pdf",
      uploadedBy: dowe.clerkUserId!,
      visibleToClient: true,
      description: "Estimate for wind damage repair on tile roof",
    },
  });

  const file5 = await prisma.claim_documents.create({
    data: {
      claimId: claim2.id,
      orgId: demoOrg.id,
      fileName: "tile-damage-photos.zip",
      fileType: "photos",
      fileSize: 6200000,
      fileUrl: "https://demo-storage.example.com/photos/az-2025-002-photos.zip",
      uploadedBy: dowe.clerkUserId!,
      visibleToClient: true,
      description: "Photos of wind-damaged tiles",
    },
  });

  console.log(`✅ Created ${file1.fileName} (visible to client)`);
  console.log(`✅ Created ${file2.fileName} (visible to client)`);
  console.log(`✅ Created ${file3.fileName} (visible to client)`);
  console.log(`✅ Created ${file4.fileName} (visible to client)`);
  console.log(`✅ Created ${file5.fileName} (visible to client)\n`);

  // Create Client Feedback Comments
  console.log("💬 Creating client feedback threads...");

  // Sarah's feedback on estimate
  await prisma.claimFileComment.create({
    data: {
      claimId: claim1.id,
      claimFileId: file1.id,
      authorId: sarah.id,
      authorRole: "CLIENT",
      body: "This looks great! I had a question about the timeline - when would you be able to start the work?",
      createdAt: new Date("2025-01-21T10:30:00Z"),
    },
  });

  await prisma.claimFileComment.create({
    data: {
      claimId: claim1.id,
      claimFileId: file1.id,
      authorId: damien.clerkUserId!,
      authorRole: "PRO",
      body: "Hi Sarah! We can start as early as Feb 5th. Weather permitting, the project should take 2-3 days total.",
      createdAt: new Date("2025-01-21T14:15:00Z"),
    },
  });

  await prisma.claimFileComment.create({
    data: {
      claimId: claim1.id,
      claimFileId: file1.id,
      authorId: sarah.id,
      authorRole: "CLIENT",
      body: "Perfect! That works for us. Looking forward to getting this done.",
      createdAt: new Date("2025-01-21T16:45:00Z"),
    },
  });

  // Mike's feedback on estimate
  await prisma.claimFileComment.create({
    data: {
      claimId: claim2.id,
      claimFileId: file4.id,
      authorId: mike.id,
      authorRole: "CLIENT",
      body: "Quick question - will the new tiles match the existing color? Want to make sure it looks uniform.",
      createdAt: new Date("2025-01-26T09:20:00Z"),
    },
  });

  await prisma.claimFileComment.create({
    data: {
      claimId: claim2.id,
      claimFileId: file4.id,
      authorId: dowe.clerkUserId!,
      authorRole: "PRO",
      body: "Absolutely! We source tiles from the same manufacturer as your original roof. The color match will be perfect.",
      createdAt: new Date("2025-01-26T11:00:00Z"),
    },
  });

  console.log(`✅ Created feedback thread for Claim ${claim1.claimNumber} (3 comments)`);
  console.log(`✅ Created feedback thread for Claim ${claim2.claimNumber} (2 comments)\n`);

  // Create Timeline Events
  console.log("📅 Creating timeline events...");

  // Claim 1 Timeline (Sarah - Full Lifecycle)
  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      eventType: "claim_created",
      title: "Claim Created",
      description: "Initial claim intake for hail damage",
      userId: damien.clerkUserId!,
      timestamp: new Date("2025-01-16T08:00:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      eventType: "inspection_scheduled",
      title: "Inspection Scheduled",
      description: "On-site inspection scheduled for Jan 20th",
      userId: damien.clerkUserId!,
      timestamp: new Date("2025-01-17T10:30:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      eventType: "inspection_completed",
      title: "Inspection Completed",
      description: "Roof inspection completed, extensive hail damage confirmed",
      userId: dowe.clerkUserId!,
      timestamp: new Date("2025-01-20T14:00:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      eventType: "estimate_sent",
      title: "Estimate Sent",
      description: "Estimate sent to customer and insurance adjuster",
      userId: damien.clerkUserId!,
      timestamp: new Date("2025-01-21T09:00:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      eventType: "claim_approved",
      title: "Claim Approved",
      description: "Insurance approved full estimate of $26,200",
      userId: damien.clerkUserId!,
      timestamp: new Date("2025-01-24T16:30:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim1.id,
      orgId: demoOrg.id,
      eventType: "status_changed",
      title: "Moved to Production",
      description: "Claim moved to production stage, materials ordered",
      userId: damien.clerkUserId!,
      timestamp: new Date("2025-01-25T11:00:00Z"),
    },
  });

  // Claim 2 Timeline (Mike - Estimate Stage)
  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim2.id,
      orgId: demoOrg.id,
      eventType: "claim_created",
      title: "Claim Created",
      description: "Initial claim intake for wind damage",
      userId: dowe.clerkUserId!,
      timestamp: new Date("2025-01-23T09:15:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim2.id,
      orgId: demoOrg.id,
      eventType: "inspection_completed",
      title: "Inspection Completed",
      description: "Tile roof inspection completed",
      userId: dowe.clerkUserId!,
      timestamp: new Date("2025-01-25T13:30:00Z"),
    },
  });

  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim2.id,
      orgId: demoOrg.id,
      eventType: "estimate_sent",
      title: "Estimate Sent",
      description: "Estimate sent, awaiting customer and insurance approval",
      userId: dowe.clerkUserId!,
      timestamp: new Date("2025-01-26T08:45:00Z"),
    },
  });

  // Claim 3 Timeline (Emily - Just Started)
  await prisma.claimTimelineEvent.create({
    data: {
      claimId: claim3.id,
      orgId: demoOrg.id,
      eventType: "claim_created",
      title: "Claim Created",
      description: "New claim for recent storm damage",
      userId: damien.clerkUserId!,
      timestamp: new Date("2025-01-29T07:30:00Z"),
    },
  });

  console.log(`✅ Created timeline for Claim ${claim1.claimNumber} (6 events)`);
  console.log(`✅ Created timeline for Claim ${claim2.claimNumber} (3 events)`);
  console.log(`✅ Created timeline for Claim ${claim3.claimNumber} (1 event)\n`);

  // Create Trade Partners
  console.log("🤝 Creating trade partner network...");

  const trade1 = await prisma.tradePartner.create({
    data: {
      orgId: demoOrg.id,
      businessName: "Elite Roofing Contractors",
      contactName: "Jake Thompson",
      email: "jake@eliteroofingaz.com",
      phone: "+1-928-555-2001",
      licenseNumber: "AZ-ROC-123456",
      specialties: ["roofing", "shingles", "repairs"],
      rating: 4.8,
      notes: "Premium roofing contractor, excellent quality work",
    },
  });

  const trade2 = await prisma.tradePartner.create({
    data: {
      orgId: demoOrg.id,
      businessName: "Prescott Gutter & Siding",
      contactName: "Maria Santos",
      email: "maria@prescottgutter.com",
      phone: "+1-928-555-2002",
      licenseNumber: "AZ-ROC-234567",
      specialties: ["gutters", "siding", "fascia"],
      rating: 4.6,
      notes: "Reliable partner for gutter and siding work",
    },
  });

  console.log(`✅ ${trade1.businessName} (${trade1.licenseNumber})`);
  console.log(`✅ ${trade2.businessName} (${trade2.licenseNumber})\n`);

  // Assign Trades to Claims
  console.log("🔗 Assigning trades to claims...");

  await prisma.claimTradePartner.create({
    data: {
      claimId: claim1.id,
      tradePartnerId: trade1.id,
      role: "primary",
      status: "assigned",
      assignedAt: new Date("2025-01-25T12:00:00Z"),
      notes: "Primary contractor for full roof replacement",
    },
  });

  await prisma.claimTradePartner.create({
    data: {
      claimId: claim1.id,
      tradePartnerId: trade2.id,
      role: "subcontractor",
      status: "assigned",
      assignedAt: new Date("2025-01-25T12:15:00Z"),
      notes: "Handling gutter replacement and fascia repair",
    },
  });

  await prisma.claimTradePartner.create({
    data: {
      claimId: claim2.id,
      tradePartnerId: trade1.id,
      role: "primary",
      status: "pending",
      assignedAt: new Date("2025-01-26T10:00:00Z"),
      notes: "Pending approval for tile repair work",
    },
  });

  console.log(`✅ Assigned ${trade1.businessName} to Claim ${claim1.claimNumber}`);
  console.log(`✅ Assigned ${trade2.businessName} to Claim ${claim1.claimNumber}`);
  console.log(`✅ Assigned ${trade1.businessName} to Claim ${claim2.claimNumber}\n`);

  // Create Notifications
  console.log("🔔 Creating notifications...");

  // Client feedback notifications
  await prisma.projectNotification.create({
    data: {
      userId: damien.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "CLIENT_UPDATE",
      type: "DOC_COMMENT_FROM_CLIENT",
      title: "New client comment on estimate",
      message: "Sarah Johnson commented on hail-damage-estimate.pdf",
      link: `/claims/${claim1.id}?tab=files`,
      read: false,
      createdAt: new Date("2025-01-21T10:31:00Z"),
    },
  });

  await prisma.projectNotification.create({
    data: {
      userId: damien.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim2.id,
      category: "CLIENT_UPDATE",
      type: "DOC_COMMENT_FROM_CLIENT",
      title: "New client comment on estimate",
      message: "Mike Peterson commented on wind-damage-estimate.pdf",
      link: `/claims/${claim2.id}?tab=files`,
      read: false,
      createdAt: new Date("2025-01-26T09:21:00Z"),
    },
  });

  // Portal photo uploads (simulated)
  await prisma.projectNotification.create({
    data: {
      userId: dowe.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "CLIENT_UPDATE",
      type: "PORTAL_PHOTO_UPLOADED",
      title: "Client uploaded portal photos",
      message: "Sarah Johnson uploaded 5 new photos via portal",
      link: `/claims/${claim1.id}?tab=photos`,
      read: true,
      createdAt: new Date("2025-01-19T14:22:00Z"),
    },
  });

  await prisma.projectNotification.create({
    data: {
      userId: dowe.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim2.id,
      category: "CLIENT_UPDATE",
      type: "PORTAL_PHOTO_UPLOADED",
      title: "Client uploaded portal photos",
      message: "Mike Peterson uploaded 3 new photos via portal",
      link: `/claims/${claim2.id}?tab=photos`,
      read: true,
      createdAt: new Date("2025-01-24T11:15:00Z"),
    },
  });

  // Trade assignment notifications
  await prisma.projectNotification.create({
    data: {
      userId: damien.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "TRADES_UPDATE",
      type: "TRADE_ASSIGNED",
      title: "Trade partner assigned",
      message: "Elite Roofing Contractors assigned to AZ-2025-001",
      link: `/claims/${claim1.id}?tab=trades`,
      read: true,
      createdAt: new Date("2025-01-25T12:01:00Z"),
    },
  });

  await prisma.projectNotification.create({
    data: {
      userId: damien.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "TRADES_UPDATE",
      type: "TRADE_ASSIGNED",
      title: "Trade partner assigned",
      message: "Prescott Gutter & Siding assigned to AZ-2025-001",
      link: `/claims/${claim1.id}?tab=trades`,
      read: true,
      createdAt: new Date("2025-01-25T12:16:00Z"),
    },
  });

  // File sharing notifications
  await prisma.projectNotification.create({
    data: {
      userId: dowe.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "TEAM_UPDATE",
      type: "FILE_SHARED",
      title: "Document shared with client",
      message: "Estimate shared with Sarah Johnson",
      link: `/claims/${claim1.id}?tab=files`,
      read: true,
      createdAt: new Date("2025-01-21T09:01:00Z"),
    },
  });

  await prisma.projectNotification.create({
    data: {
      userId: dowe.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim2.id,
      category: "TEAM_UPDATE",
      type: "FILE_SHARED",
      title: "Document shared with client",
      message: "Estimate shared with Mike Peterson",
      link: `/claims/${claim2.id}?tab=files`,
      read: true,
      createdAt: new Date("2025-01-26T08:46:00Z"),
    },
  });

  // Status change notifications
  await prisma.projectNotification.create({
    data: {
      userId: dowe.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "TEAM_UPDATE",
      type: "STATUS_CHANGED",
      title: "Claim status updated",
      message: "AZ-2025-001 moved to Production",
      link: `/claims/${claim1.id}`,
      read: true,
      createdAt: new Date("2025-01-25T11:01:00Z"),
    },
  });

  await prisma.projectNotification.create({
    data: {
      userId: damien.clerkUserId!,
      orgId: demoOrg.id,
      claimId: claim1.id,
      category: "TEAM_UPDATE",
      type: "STATUS_CHANGED",
      title: "Claim approved",
      message: "AZ-2025-001 approved by State Farm",
      link: `/claims/${claim1.id}`,
      read: true,
      createdAt: new Date("2025-01-24T16:31:00Z"),
    },
  });

  console.log("✅ Created 11 notifications across all categories\n");

  // Create Client Portal Access
  console.log("🔐 Creating portal access tokens...");

  await prisma.clientPortalAccess.create({
    data: {
      clientId: sarah.id,
      claimId: claim1.id,
      token: `demo_token_sarah_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date("2026-12-31"),
    },
  });

  await prisma.clientPortalAccess.create({
    data: {
      clientId: mike.id,
      claimId: claim2.id,
      token: `demo_token_mike_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date("2026-12-31"),
    },
  });

  await prisma.clientPortalAccess.create({
    data: {
      clientId: emily.id,
      claimId: claim3.id,
      token: `demo_token_emily_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date("2026-12-31"),
    },
  });

  console.log(`✅ Created portal access for ${sarah.name}`);
  console.log(`✅ Created portal access for ${mike.name}`);
  console.log(`✅ Created portal access for ${emily.name}\n`);

  // Final Summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ ARIZONA STORM DEMO GENERATOR v2 COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📊 Demo Environment Summary:");
  console.log(`   🏢 Organization: ${demoOrg.name}`);
  console.log(`   👥 Pro Users: 2 (${damien.firstName}, ${dowe.firstName})`);
  console.log(`   🏠 Clients: 3 (Sarah, Mike, Emily)`);
  console.log(`   🏘️  Properties: 3 (Prescott area)`);
  console.log(`   📋 Claims: 3 (Full lifecycle stages)`);
  console.log(`   📁 Files: 5 (All visible to clients)`);
  console.log(`   💬 Comments: 5 (Client feedback threads)`);
  console.log(`   📅 Timeline Events: 10`);
  console.log(`   🤝 Trade Partners: 2 with 3 assignments`);
  console.log(`   🔔 Notifications: 11 (All categories)`);
  console.log(`   🔐 Portal Tokens: 3\n`);

  console.log("🎯 Features Demonstrated:");
  console.log("   ✅ Portal Photos (simulated uploads)");
  console.log("   ✅ File Sharing (visibleToClient flags)");
  console.log("   ✅ Document Q&A (ClaimFileComment threads)");
  console.log("   ✅ Timeline (ClaimTimelineEvent progression)");
  console.log("   ✅ Notifications (11 types across 3 categories)");
  console.log("   ✅ Trades Network (ClaimTradePartner assignments)");
  console.log("   ✅ Client Portal Access (tokens for 3 clients)\n");

  console.log("🌩️  Demo ready! Set DEMO_MODE=true and reload CRM.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Demo seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
