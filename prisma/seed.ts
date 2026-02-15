/**
 * ========================================
 * MINI ARIZONA DEMO SEED
 * ========================================
 *
 * Creates minimal realistic demo data for investor pitch:
 * - 1 demo organization: "SkaiScraper Demo - Arizona Storm"
 * - 2 pro users: Damien (owner) + Dowe (admin)
 * - 2 realistic storm leads in Arizona communities
 * - 2 claims tied to those leads with realistic hail/wind damage
 *
 * Models Used:
 * - Org: Organization/company
 * - users: Pro user accounts (Damien, Dowe)
 * - contacts: Homeowner/client contacts
 * - properties: Property records with address data
 * - leads: Lead pipeline entries
 * - claims: Insurance claims with damage details
 */

import { PrismaClient, Role } from "@prisma/client";
import { randomUUID } from "crypto";

import { seedReportTemplates } from "./seed-report-templates";

const prisma = new PrismaClient();

async function main() {
  console.log("🌵 Starting Arizona Demo Seed...\n");

  // ============================================
  // STEP 0: Clear Existing Demo Data
  // ============================================
  console.log("🧹 Clearing existing demo data...");

  // Delete in reverse order of foreign key dependencies
  await prisma.claims.deleteMany({
    where: {
      claimNumber: {
        startsWith: "AZ-",
      },
    },
  });

  await prisma.leads.deleteMany({
    where: {
      title: {
        contains: "Show Low Storm",
      },
    },
  });

  await prisma.leads.deleteMany({
    where: {
      title: {
        contains: "Flagstaff Monsoon",
      },
    },
  });

  await prisma.properties.deleteMany({
    where: {
      name: {
        in: ["Henderson Residence", "Torres Residence"],
      },
    },
  });

  await prisma.contacts.deleteMany({
    where: {
      email: {
        endsWith: ".demo@example.com",
      },
    },
  });

  await prisma.users.deleteMany({
    where: {
      email: {
        endsWith: ".demo@skaiscraper.ai",
      },
    },
  });

  await prisma.org.deleteMany({
    where: {
      name: {
        contains: "SkaiScraper Demo",
      },
    },
  });

  console.log("✅ Cleared existing demo data\n");

  // ============================================
  // STEP 1: Create Demo Organization
  // ============================================
  const demoOrgId = randomUUID();
  const demoOrg = await prisma.org.create({
    data: {
      id: demoOrgId,
      clerkOrgId: `org_demo_${Date.now()}`,
      name: "SkaiScraper Demo - Arizona Storm",
      planKey: "professional",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created demo org:", demoOrg.name);

  // ============================================
  // STEP 2: Create Pro Users (Damien + Dowe)
  // ============================================
  const damienId = randomUUID();
  const damien = await prisma.users.create({
    data: {
      id: damienId,
      clerkUserId: `user_damien_demo_${Date.now()}`,
      email: "damien.demo@skaiscraper.ai",
      name: "Damien Rodriguez",
      role: Role.ADMIN,
      orgId: demoOrgId,
      title: "Founder & CEO",
      phone: "+1 (480) 555-0100",
      bio: "Storm damage restoration expert with 15+ years experience in Arizona markets",
      years_experience: 15,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    },
  });
  console.log("✅ Created user:", damien.name, `(${damien.email})`);

  const doweId = randomUUID();
  const dowe = await prisma.users.create({
    data: {
      id: doweId,
      clerkUserId: `user_dowe_demo_${Date.now()}`,
      email: "dowe.demo@skaiscraper.ai",
      name: "Dowe Mitchell",
      role: Role.ADMIN,
      orgId: demoOrgId,
      title: "Operations Director",
      phone: "+1 (480) 555-0101",
      bio: "Claims specialist focused on hail and wind damage assessments",
      years_experience: 8,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    },
  });
  console.log("✅ Created user:", dowe.name, `(${dowe.email})`);

  // ============================================
  // STEP 3: Create Demo Contacts (Homeowners)
  // ============================================
  const contact1Id = randomUUID();
  const contact1 = await prisma.contacts.create({
    data: {
      id: contact1Id,
      first_name: "Sarah",
      last_name: "Henderson",
      email: "sarah.henderson.demo@example.com",
      phone: "+1 (928) 555-0201",
      street: "4823 Mountain View Drive",
      city: "Show Low",
      state: "AZ",
      zip_code: "85901",
      source: "Door Knocking",
      notes:
        "Homeowner reported hail damage after July storm. Roof is 12 years old, architectural shingles.",
      org_id: demoOrgId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  console.log(
    "✅ Created contact:",
    `${contact1.first_name} ${contact1.last_name}`,
    `- ${contact1.city}, AZ`
  );

  const contact2Id = randomUUID();
  const contact2 = await prisma.contacts.create({
    data: {
      id: contact2Id,
      first_name: "Michael",
      last_name: "Torres",
      email: "michael.torres.demo@example.com",
      phone: "+1 (928) 555-0202",
      street: "1567 Ponderosa Lane",
      city: "Flagstaff",
      state: "AZ",
      zip_code: "86001",
      source: "Referral",
      notes:
        "Referred by neighbor. Concerned about wind damage on north slope after monsoon season.",
      org_id: demoOrgId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  console.log(
    "✅ Created contact:",
    `${contact2.first_name} ${contact2.last_name}`,
    `- ${contact2.city}, AZ`
  );

  // ============================================
  // STEP 4: Create Properties
  // ============================================
  const property1Id = randomUUID();
  const property1 = await prisma.properties.create({
    data: {
      id: property1Id,
      orgId: demoOrgId,
      contactId: contact1Id,
      name: "Henderson Residence",
      propertyType: "Single Family",
      street: "4823 Mountain View Drive",
      city: "Show Low",
      state: "AZ",
      zipCode: "85901",
      yearBuilt: 2012,
      squareFootage: 2400,
      roofType: "Architectural Shingle",
      roofAge: 12,
      carrier: "State Farm",
      policyNumber: "SF-AZ-8590142",
      address: "4823 Mountain View Drive, Show Low, AZ 85901",
      latitude: 34.2542,
      longitude: -110.0298,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created property:", property1.name);

  const property2Id = randomUUID();
  const property2 = await prisma.properties.create({
    data: {
      id: property2Id,
      orgId: demoOrgId,
      contactId: contact2Id,
      name: "Torres Residence",
      propertyType: "Single Family",
      street: "1567 Ponderosa Lane",
      city: "Flagstaff",
      state: "AZ",
      zipCode: "86001",
      yearBuilt: 2008,
      squareFootage: 2800,
      roofType: "Composite Tile",
      roofAge: 16,
      carrier: "Allstate",
      policyNumber: "AL-AZ-8600189",
      address: "1567 Ponderosa Lane, Flagstaff, AZ 86001",
      latitude: 35.1983,
      longitude: -111.6513,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created property:", property2.name);

  // ============================================
  // STEP 5: Create Leads
  // ============================================
  const lead1Id = randomUUID();
  const lead1 = await prisma.leads.create({
    data: {
      id: lead1Id,
      orgId: demoOrgId,
      contactId: contact1Id,
      title: "Hail Damage - Show Low Storm July 2024",
      description:
        "Homeowner reported visible hail damage after severe thunderstorm on July 15, 2024. Multiple granule loss areas observed during initial inspection. Approximately 2,400 sq ft roof needs assessment.",
      source: "Door Knocking",
      value: 18500,
      probability: 75,
      stage: "inspection_scheduled",
      temperature: "hot",
      assignedTo: damienId,
      createdBy: damienId,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created lead:", lead1.title);

  const lead2Id = randomUUID();
  const lead2 = await prisma.leads.create({
    data: {
      id: lead2Id,
      orgId: demoOrgId,
      contactId: contact2Id,
      title: "Wind Damage - Flagstaff Monsoon August 2024",
      description:
        "Multiple cracked and displaced tiles on north slope. Homeowner concerned about water intrusion potential. Referred by satisfied neighbor. Property has composite tile roof installed in 2008.",
      source: "Referral",
      value: 24000,
      probability: 60,
      stage: "contacted",
      temperature: "warm",
      assignedTo: doweId,
      createdBy: doweId,
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created lead:", lead2.title);

  // ============================================
  // STEP 6: Create Claims
  // ============================================
  const claim1Id = randomUUID();
  const claim1 = await prisma.claims.create({
    data: {
      id: claim1Id,
      orgId: demoOrgId,
      propertyId: property1Id,
      claimNumber: `AZ-HAIL-${Date.now().toString().slice(-6)}`,
      title: "Hail Damage Claim - Henderson Residence",
      description:
        "Severe hail storm on July 15, 2024 caused extensive damage to architectural shingle roof. Multiple impact points documented with 1-1.25 inch hail confirmed by NWS. Significant granule loss across all slopes, multiple cracked and bruised shingles, damaged ridge caps. Gutters show hail dents. Estimated 2,400 sq ft roof replacement required.",
      damageType: "hail",
      dateOfLoss: new Date("2024-07-15"),
      carrier: "State Farm",
      adjusterName: "Jennifer Williams",
      adjusterPhone: "+1 (800) 555-0150",
      adjusterEmail: "jwilliams.demo@statefarm.example",
      status: "active",
      priority: "high",
      estimatedValue: 18500,
      deductible: 2500,
      assignedTo: damienId,
      insured_name: "Sarah Henderson",
      policy_number: "SF-AZ-8590142",
      homeowner_email: "sarah.henderson.demo@example.com",
      lifecycle_stage: "ADJUSTER_REVIEW",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created claim:", claim1.claimNumber, "-", claim1.title);

  const claim2Id = randomUUID();
  const claim2 = await prisma.claims.create({
    data: {
      id: claim2Id,
      orgId: demoOrgId,
      propertyId: property2Id,
      claimNumber: `AZ-WIND-${Date.now().toString().slice(-6)}`,
      title: "Wind Damage Claim - Torres Residence",
      description:
        "High wind event during monsoon season August 8, 2024 caused significant damage to composite tile roof. Multiple tiles cracked, displaced, and missing on north and west slopes. Wind speeds estimated at 65+ mph. Ridge tiles compromised. Underlayment exposure in several areas creating water intrusion risk. Approximately 35-40% of roof tiles need replacement, full roof restoration recommended given age and extent of damage.",
      damageType: "wind",
      dateOfLoss: new Date("2024-08-08"),
      carrier: "Allstate",
      adjusterName: "Robert Chen",
      adjusterPhone: "+1 (800) 555-0175",
      adjusterEmail: "rchen.demo@allstate.example",
      status: "active",
      priority: "high",
      estimatedValue: 24000,
      approvedValue: 22000,
      deductible: 1000,
      assignedTo: doweId,
      insured_name: "Michael Torres",
      policy_number: "AL-AZ-8600189",
      homeowner_email: "michael.torres.demo@example.com",
      lifecycle_stage: "APPROVED",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created claim:", claim2.claimNumber, "-", claim2.title);

  // Link claims to leads
  await prisma.leads.update({
    where: { id: lead1Id },
    data: { claimId: claim1Id },
  });

  await prisma.leads.update({
    where: { id: lead2Id },
    data: { claimId: claim2Id },
  });

  // ============================================
  // STEP 7: Create Vendor/Trade Partners
  // ============================================
  console.log("\n🏢 Creating vendor directory...");

  const vendors = [
    {
      businessName: "GAF",
      phone: "1-877-423-7663",
      email: "info@gaf.com",
      specialties: ["Shingles", "TPO", "Underlayment", "Accessories"],
      repName: "Regional Sales Manager",
      repEmail: "southwest@gaf.com",
      repPhone: "1-877-423-7663",
      repTitle: "Sales Manager",
      notes:
        "North America's largest roofing manufacturer with full residential & commercial systems.",
    },
    {
      businessName: "ABC Supply",
      phone: "1-888-222-8211",
      email: "info@abcsupply.com",
      specialties: ["Distribution", "All Major Brands", "Same-Day Delivery"],
      repName: "Branch Manager",
      repEmail: "phoenix@abcsupply.com",
      repPhone: "1-888-222-8211",
      repTitle: "Branch Manager",
      notes: "Largest wholesale distributor of roofing in North America. Carries all major brands.",
    },
    {
      businessName: "SRS Distribution",
      phone: "1-855-877-3311",
      email: "info@srs-d.com",
      specialties: ["Distribution", "Full-Service", "Estimating Support"],
      repName: "Sales Representative",
      repEmail: "arizona@srs-d.com",
      repPhone: "1-855-877-3311",
      repTitle: "Sales Rep",
      notes: "Leading independent roofing distributor with extensive product selection.",
    },
    {
      businessName: "Westlake Royal Roofing Solutions",
      phone: "1-844-624-7663",
      email: "info@westlakeroyalroofing.com",
      specialties: ["Tile", "Metal", "Shingles", "Boral", "Eagle"],
      repName: "Territory Manager",
      repEmail: "southwest@westlakeroyalroofing.com",
      repPhone: "1-844-624-7663",
      repTitle: "Territory Manager",
      notes: "Comprehensive roofing manufacturer including Boral, Eagle, Saxony, and EdCo brands.",
    },
    {
      businessName: "Elite Roofing Supply",
      phone: "1-888-354-8377",
      email: "info@eliteroofingsupply.com",
      specialties: ["Distribution", "Technical Support", "Training"],
      repName: "Account Manager",
      repEmail: "phoenix@eliteroofingsupply.com",
      repPhone: "1-888-354-8377",
      repTitle: "Account Manager",
      notes: "Regional roofing distributor known for personalized service and technical expertise.",
    },
  ];

  for (const vendor of vendors) {
    await prisma.tradePartner.create({
      data: {
        id: randomUUID(),
        orgId: demoOrgId,
        ...vendor,
        createdAt: new Date(),
      },
    });
    console.log(`✅ Created vendor: ${vendor.businessName}`);
  }

  // ============================================
  // SEED REPORT TEMPLATES
  // ============================================
  await seedReportTemplates(demoOrg.id);

  console.log("\n🎉 ========================================");
  console.log("✅ MINIMAL DEMO SEED COMPLETE!");
  console.log("========================================");
  console.log(`
📊 Summary:
- Organization: ${demoOrg.name}
- Pro Users: 2 (Damien + Dowe)
- Contacts: 2 Arizona homeowners
- Properties: 2 with full address data
- Leads: 2 realistic storm leads
- Claims: 2 linked claims with damage details
- Vendors: 5 major roofing suppliers (GAF, ABC Supply, SRS, Westlake, Elite)

🚀 Ready for investor demo:
1. Run: pnpm dev
2. Log in with Clerk
3. Navigate to:
   - /leads → See 2 Arizona storm leads
   - /claims → See 2 detailed claims
   - /contacts → See 2 homeowner contacts
   - /teams → See Damien + Dowe
   - /vendors → See 5 roofing vendors

💡 All data is realistic but fake - perfect for demo!
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
