import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Explicitly load .env.local
config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive CRM seeding...");

  // Create organization (or use existing)
  const org = await prisma.org.upsert({
    where: { clerkOrgId: "demo-org-123" },
    update: { name: "ClearSkai Technologies Demo" },
    create: {
      clerkOrgId: "demo-org-123",
      name: "ClearSkai Technologies Demo",
    },
  });

  console.log(`📊 Using organization: ${org.name} (${org.id})`);

  // Ensure token wallet exists with good balance
  const wallet = await prisma.tokenWallet.upsert({
    where: { orgId: org.id },
    update: { aiRemaining: 1000 },
    create: {
      orgId: org.id,
      aiRemaining: 1000,
      dolCheckRemain: 100,
      dolFullRemain: 50,
    },
  });

  console.log(`💰 Token wallet: ${wallet.aiRemaining} AI tokens available`);

  // Create demo users with proper CRM roles
  const users = await Promise.all([
    prisma.users.upsert({
      where: { clerkUserId: "user_demo_admin" },
      update: {},
      create: {
        clerkUserId: "user_demo_admin",
        email: "damien@clearskai.com",
        name: "Damien Willingham",
        role: "ADMIN",
        orgId: org.id,
      },
    }),
    prisma.users.upsert({
      where: { clerkUserId: "user_demo_pm" },
      update: {},
      create: {
        clerkUserId: "user_demo_pm",
        email: "sarah@clearskai.com",
        name: "Sarah Johnson",
        role: "PM",
        orgId: org.id,
      },
    }),
    prisma.users.upsert({
      where: { clerkUserId: "user_demo_inspector" },
      update: {},
      create: {
        clerkUserId: "user_demo_inspector",
        email: "mike@clearskai.com",
        name: "Mike Rodriguez",
        role: "INSPECTOR",
        orgId: org.id,
      },
    }),
  ]);

  console.log(`👥 Created ${users.length} demo users`);

  // Create diverse demo contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        orgId: org.id,
        firstName: "Bob",
        lastName: "Koon",
        email: "bob.koon@email.com",
        phone: "(555) 123-4567",
        company: "Koon Construction",
        street: "516 Power Box Rd",
        city: "Clarkdale",
        state: "AZ",
        zipCode: "86324",
        source: "referral",
        notes: "Contractor referral - experienced with insurance claims",
        tags: ["contractor", "referral", "priority"],
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        firstName: "Mary",
        lastName: "Smith",
        email: "mary.smith@email.com",
        phone: "(555) 234-5678",
        street: "123 Oak Street",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        source: "website",
        notes: "Found us through Google search after hail storm",
        tags: ["web-lead", "hail-damage"],
      },
    }),
    prisma.contact.create({
      data: {
        orgId: org.id,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "(555) 345-6789",
        company: "ABC Property Management",
        street: "456 Pine Avenue",
        city: "Scottsdale",
        state: "AZ",
        zipCode: "85251",
        source: "cold_call",
        notes: "Property manager with 15+ commercial properties",
        tags: ["commercial", "property-manager"],
      },
    }),
  ]);

  console.log(`📞 Created ${contacts.length} demo contacts`);

  // Create corresponding properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        orgId: org.id,
        contactId: contacts[0].id,
        name: "Main Residence",
        propertyType: "residential",
        street: "516 Power Box Rd",
        city: "Clarkdale",
        state: "AZ",
        zipCode: "86324",
        yearBuilt: 1995,
        squareFootage: 2400,
        roofType: "shingle",
        roofAge: 15,
        carrier: "State Farm",
        policyNumber: "SF-123456789",
      },
    }),
    prisma.property.create({
      data: {
        orgId: org.id,
        contactId: contacts[1].id,
        name: "Family Home",
        propertyType: "residential",
        street: "123 Oak Street",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        yearBuilt: 2005,
        squareFootage: 1800,
        roofType: "tile",
        roofAge: 8,
        carrier: "Allstate",
        policyNumber: "AS-987654321",
      },
    }),
    prisma.property.create({
      data: {
        orgId: org.id,
        contactId: contacts[2].id,
        name: "Office Complex",
        propertyType: "commercial",
        street: "456 Pine Avenue",
        city: "Scottsdale",
        state: "AZ",
        zipCode: "85251",
        yearBuilt: 1985,
        squareFootage: 8500,
        roofType: "metal",
        roofAge: 20,
        carrier: "Commercial Insurance Co",
        policyNumber: "CIC-456789123",
      },
    }),
  ]);

  console.log(`🏠 Created ${properties.length} demo properties`);

  // Create demo leads at different stages
  const leads = await Promise.all([
    prisma.leads.create({
      data: {
        orgId: org.id,
        contactId: contacts[2].id,
        title: "Commercial Roof Maintenance",
        description: "Interested in preventive maintenance program",
        source: "website",
        value: 25000,
        probability: 60,
        stage: "new",
        temperature: "warm",
        assignedTo: users[1].id,
        createdBy: users[0].id,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`📈 Created ${leads.length} demo leads`);

  // Create projects representing different pipeline stages
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        orgId: org.id,
        contactId: contacts[0].id,
        propertyId: properties[0].id,
        title: "Hail Damage Roof Repair",
        jobNumber: "P000001",
        status: "APPROVED", // In production
        startDate: new Date("2024-11-15"),
        targetEndDate: new Date("2024-12-15"),
        createdBy: users[0].id,
        assignedTo: users[1].id,
        valueEstimate: 15000,
        notes: "Customer reported hail damage after recent storm. Insurance approved.",
      },
    }),
    prisma.project.create({
      data: {
        orgId: org.id,
        contactId: contacts[1].id,
        propertyId: properties[1].id,
        title: "Complete Roof Replacement",
        jobNumber: "P000002",
        status: "ESTIMATE_SENT",
        startDate: new Date("2024-11-20"),
        targetEndDate: new Date("2025-01-20"),
        createdBy: users[0].id,
        assignedTo: users[1].id,
        valueEstimate: 28000,
        notes: "Tile roof needs complete replacement due to age and multiple leaks.",
      },
    }),
    prisma.project.create({
      data: {
        orgId: org.id,
        contactId: contacts[2].id,
        propertyId: properties[2].id,
        title: "Emergency Leak Repair",
        jobNumber: "P000003",
        status: "INSPECTION_SCHEDULED",
        startDate: new Date("2024-11-10"),
        targetEndDate: new Date("2024-11-25"),
        createdBy: users[0].id,
        assignedTo: users[2].id,
        valueEstimate: 3500,
        notes: "Urgent leak repair needed in office building.",
      },
    }),
  ]);

  console.log(`🏗️ Created ${projects.length} demo projects`);

  // Create inspections
  const inspections = await Promise.all([
    prisma.inspection.create({
      data: {
        orgId: org.id,
        propertyId: properties[0].id,
        projectId: projects[0].id,
        title: "Hail Damage Assessment",
        type: "initial",
        scheduledAt: new Date("2024-10-25T10:00:00"),
        completedAt: new Date("2024-10-25T12:30:00"),
        inspectorId: users[2].id,
        inspectorName: "Mike Rodriguez",
        status: "completed",
        notes: "Significant hail damage on south slope. Multiple impacts documented.",
        photoCount: 45,
      },
    }),
    prisma.inspection.create({
      data: {
        orgId: org.id,
        propertyId: properties[2].id,
        projectId: projects[2].id,
        title: "Emergency Leak Inspection",
        type: "initial",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        inspectorId: users[2].id,
        inspectorName: "Mike Rodriguez",
        status: "scheduled",
        notes: "Urgent - water intrusion in conference room",
        photoCount: 0,
      },
    }),
  ]);

  console.log(`🔍 Created ${inspections.length} demo inspections`);

  // Create claims
  const claims = await Promise.all([
    prisma.claims.create({
      data: {
        orgId: org.id,
        propertyId: properties[0].id,
        projectId: projects[0].id,
        claimNumber: "SF-CLAIM-2024-001",
        title: "Hail Damage Claim",
        description: "Insurance claim for hail damage sustained during storm",
        damageType: "hail",
        dateOfLoss: new Date("2024-10-15"),
        carrier: "State Farm",
        adjusterName: "Jennifer Wilson",
        adjusterPhone: "(555) 888-1234",
        adjusterEmail: "j.wilson@statefarm.com",
        status: "approved",
        priority: "high",
        estimatedValue: 15000,
        approvedValue: 14500,
        deductible: 1000,
        assignedTo: users[1].id,
      },
    }),
  ]);

  console.log(`📋 Created ${claims.length} demo claims`);

  // Create estimates
  const estimates = await Promise.all([
    prisma.estimate.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        authorId: users[1].id,
        title: "Hail Damage Repair Estimate",
        description: "Comprehensive estimate for hail damage repairs",
        tool: "xactimate",
        subtotal: 13636.36,
        tax: 1363.64,
        total: 15000,
        status: "ACCEPTED",
      },
    }),
    prisma.estimate.create({
      data: {
        orgId: org.id,
        projectId: projects[1].id,
        authorId: users[1].id,
        title: "Complete Roof Replacement",
        description: "Full roof replacement with tile material",
        tool: "internal",
        subtotal: 25454.55,
        tax: 2545.45,
        total: 28000,
        status: "SENT",
      },
    }),
  ]);

  console.log(`💰 Created ${estimates.length} demo estimates`);

  // Create documents
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        type: "PHOTO",
        title: "Hail Damage Documentation",
        url: "https://example.com/photos/hail-damage-001.zip",
        mimeType: "application/zip",
        sizeBytes: 25600000,
        category: "damage",
      },
    }),
    prisma.document.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        type: "PDF",
        title: "Insurance Estimate",
        url: "https://example.com/estimates/p000001-estimate.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024000,
        category: "estimate",
      },
    }),
  ]);

  console.log(`📄 Created ${documents.length} demo documents`);

  // Create variety of tasks at different priorities and due dates
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        orgId: org.id,
        projectId: projects[1].id,
        assigneeId: users[1].id,
        title: "Follow up on estimate",
        description: "Check if Mary has any questions about the roof replacement estimate",
        type: "follow_up",
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: "TODO",
        priority: "MEDIUM",
      },
    }),
    prisma.task.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        assigneeId: users[0].id,
        title: "Schedule production crew",
        description: "Coordinate crew availability for Bob's roof repair",
        type: "scheduling",
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "TODO",
        priority: "HIGH",
      },
    }),
    prisma.task.create({
      data: {
        orgId: org.id,
        projectId: projects[2].id,
        assigneeId: users[2].id,
        title: "Emergency inspection report",
        description: "Complete urgent inspection report for leak",
        type: "documentation",
        dueAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
        status: "IN_PROGRESS",
        priority: "URGENT",
      },
    }),
    prisma.task.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        assigneeId: users[1].id,
        title: "Order materials",
        description: "Order shingles and supplies for Bob's project",
        type: "procurement",
        status: "DONE",
        priority: "HIGH",
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} demo tasks`);

  // Create realistic activity timeline
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        contactId: contacts[0].id,
        type: "project_created",
        title: "Project Created",
        description: "Hail damage repair project created",
        userId: users[0].id,
        userName: "Damien Willingham",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.activity.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        type: "stage_change",
        title: "Stage Changed",
        description: "Project moved to Inspection Scheduled",
        userId: users[1].id,
        userName: "Sarah Johnson",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.activity.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        inspectionId: inspections[0].id,
        type: "inspection_completed",
        title: "Inspection Completed",
        description: "Hail damage assessment completed successfully",
        userId: users[2].id,
        userName: "Mike Rodriguez",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.activity.create({
      data: {
        orgId: org.id,
        projectId: projects[0].id,
        claimId: claims[0].id,
        type: "claim_approved",
        title: "Claim Approved",
        description: "Insurance claim approved for $14,500",
        userId: users[1].id,
        userName: "Sarah Johnson",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`📝 Created ${activities.length} demo activities`);

  // Create token usage history
  const tokenUsages = await Promise.all([
    prisma.tokenUsage.create({
      data: {
        orgId: org.id,
        userId: users[2].id,
        action: "inspection_summary",
        tokens: 4,
        description: "AI inspection summary generation",
        refType: "inspection",
        refId: inspections[0].id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.tokenUsage.create({
      data: {
        orgId: org.id,
        userId: users[1].id,
        action: "weather_report",
        tokens: 3,
        description: "Weather verification for claim",
        refType: "claim",
        refId: claims[0].id,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.tokenUsage.create({
      data: {
        orgId: org.id,
        userId: users[0].id,
        action: "ai_mockup",
        tokens: 5,
        description: "Property mockup generation",
        refType: "project",
        refId: projects[0].id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.tokenUsage.create({
      data: {
        orgId: org.id,
        userId: users[1].id,
        action: "pdf_export",
        tokens: 2,
        description: "Estimate PDF generation",
        refType: "estimate",
        refId: estimates[0].id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log(`🎯 Created ${tokenUsages.length} token usage records`);

  // Update wallet balance
  const totalTokensUsed = tokenUsages.reduce((sum, usage) => sum + usage.tokens, 0);
  await prisma.tokenWallet.update({
    where: { orgId: org.id },
    data: {
      aiRemaining: { decrement: totalTokensUsed },
    },
  });

  console.log("✨ CRM seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${users.length} users (Admin, PM, Inspector)`);
  console.log(`   - ${contacts.length} contacts with diverse backgrounds`);
  console.log(`   - ${properties.length} properties (residential & commercial)`);
  console.log(`   - ${leads.length} leads at various stages`);
  console.log(`   - ${projects.length} projects across pipeline stages`);
  console.log(`   - ${inspections.length} inspections (completed & scheduled)`);
  console.log(`   - ${claims.length} insurance claims`);
  console.log(`   - ${estimates.length} estimates (sent & accepted)`);
  console.log(`   - ${documents.length} documents attached`);
  console.log(`   - ${tasks.length} tasks (TODO, IN_PROGRESS, DONE, OVERDUE)`);
  console.log(`   - ${activities.length} activity timeline entries`);
  console.log(`   - ${tokenUsages.length} token usage records`);
  console.log(`   - ${totalTokensUsed} tokens used from wallet`);
  console.log("\n🎉 Your CRM is now fully populated and ready!");
  console.log("\n🚀 Next steps:");
  console.log("   1. Visit /dashboard to see overview");
  console.log("   2. Check /pipeline for kanban board");
  console.log("   3. Browse /projects for project management");
  console.log("   4. View /tasks for task management");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
