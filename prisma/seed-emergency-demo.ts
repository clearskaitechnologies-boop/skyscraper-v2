/**
 * Emergency Demo Seed Script
 * Creates 2 demo claims for emergency demo workspace
 * Run with: pnpm seed:emergency-demo
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedEmergencyDemo() {
  // Only run in demo mode
  if (process.env.EMERGENCY_DEMO_MODE !== "true") {
    console.log("⏭️  EMERGENCY_DEMO_MODE not enabled, skipping seed");
    return;
  }

  console.log("🚀 Starting emergency demo seed...");

  try {
    // Find or create demo organization
    // Look for an org with a specific demo email pattern
    let demoOrg = await prisma.organizations.findFirst({
      where: {
        OR: [
          { email: { contains: "demo" } },
          { name: { contains: "Demo" } },
          { name: { contains: "Emergency" } },
        ],
      },
    });

    if (!demoOrg) {
      // If no demo org found, use the first available org
      demoOrg = await prisma.organizations.findFirst();

      if (!demoOrg) {
        console.log("❌ No organization found. Please create an organization first.");
        return;
      }
    }

    console.log(`✅ Using organization: ${demoOrg.name} (${demoOrg.id})`);

    // Check if demo claims already exist
    const existingClaims = await prisma.claims.findMany({
      where: {
        orgId: demoOrg.id,
        title: {
          in: ["Wind & Hail Damage - Mesa Property", "Storm Damage - Phoenix Residence"],
        },
      },
    });

    if (existingClaims.length >= 2) {
      console.log("✅ Demo claims already exist, skipping creation");
      return;
    }

    // Create demo claims
    const claim1 = await prisma.claims.create({
      data: {
        orgId: demoOrg.id,
        claimNumber: `DEMO-${Date.now()}-001`,
        title: "Wind & Hail Damage - Mesa Property",
        status: "open",
        policyNumber: "POL-AZ-2024-7891",
        carrier: "State Farm",
        propertyAddress: "20158 E Mesa Verde Rd, Mayer, AZ 86333",
        dateOfLoss: new Date("2024-09-15"),
        estimatedDamage: 45000,
        description:
          "Significant wind and hail damage to roof, gutters, and siding. Property owner reported loud impacts during storm on September 15th. Multiple neighbors also affected.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const claim2 = await prisma.claims.create({
      data: {
        orgId: demoOrg.id,
        claimNumber: `DEMO-${Date.now()}-002`,
        title: "Storm Damage - Phoenix Residence",
        status: "approved",
        policyNumber: "POL-AZ-2024-5623",
        carrier: "Allstate",
        propertyAddress: "1234 N Central Ave, Phoenix, AZ 85004",
        dateOfLoss: new Date("2024-10-22"),
        estimatedDamage: 28000,
        description:
          "Wind damage to roof shingles and minor hail impact. Claim approved after inspection. Awaiting contractor scheduling for repairs.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    });

    console.log(`✅ Created claim 1: ${claim1.title} (${claim1.id})`);
    console.log(`✅ Created claim 2: ${claim2.title} (${claim2.id})`);
    console.log("🎉 Emergency demo seed complete!");
  } catch (error) {
    console.error("❌ Seed error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedEmergencyDemo()
  .then(() => {
    console.log("✅ Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed script failed:", error);
    process.exit(1);
  });
