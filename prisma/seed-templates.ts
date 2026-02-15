/**
 * Seed marketplace templates
 * Run: pnpm tsx prisma/seed-templates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    slug: "water-damage-restoration",
    name: "Water Damage Restoration Report",
    description:
      "Professional water damage assessment and restoration scope template for insurance claims",
    category: "Water Damage",
    tags: ["water", "restoration", "emergency"],
    version: "1.0.0",
    thumbnailUrl: "/template-thumbs/water-damage-restoration.svg",
    previewPdfUrl: "/template-pdfs/water-damage-restoration.pdf",
    isPublished: true,
    isActive: true,
    templateJson: {
      sections: ["Claim Information", "Damage Assessment", "Restoration Scope", "Cost Estimate"],
    },
    placeholders: ["policyNumber", "dateOfLoss", "insuredName", "propertyAddress"],
  },
  {
    slug: "wind-hail-roofing",
    name: "Wind & Hail Roofing Inspection",
    description: "Comprehensive roof damage assessment template for wind and hail claims",
    category: "Roofing",
    tags: ["wind", "hail", "roofing", "storm"],
    version: "1.0.0",
    thumbnailUrl: "/template-thumbs/wind-hail-roofing.svg",
    previewPdfUrl: "/template-pdfs/wind-hail-roofing.pdf",
    isPublished: true,
    isActive: true,
    templateJson: {
      sections: [
        "Claim Information",
        "Roof Inspection Findings",
        "Damage Assessment",
        "Scope of Work",
      ],
    },
    placeholders: ["policyNumber", "dateOfLoss", "insuredName", "propertyAddress", "roofType"],
  },
  {
    slug: "general-contractor-estimate",
    name: "General Contractor Estimate",
    description: "Complete property restoration estimate template for comprehensive claims",
    category: "General Construction",
    tags: ["contractor", "estimate", "restoration", "construction"],
    version: "1.0.0",
    thumbnailUrl: "/template-thumbs/general-contractor-estimate.svg",
    previewPdfUrl: "/template-pdfs/general-contractor-estimate.pdf",
    isPublished: true,
    isActive: true,
    templateJson: {
      sections: ["Claim Information", "Scope of Work", "Cost Breakdown", "Timeline"],
    },
    placeholders: [
      "policyNumber",
      "dateOfLoss",
      "insuredName",
      "propertyAddress",
      "contractorLicense",
    ],
  },
];

async function main() {
  console.log("🌱 Seeding marketplace templates...");

  for (const template of templates) {
    const result = await prisma.template.upsert({
      where: { slug: template.slug },
      update: template,
      create: template,
    });

    console.log(`✅ ${result.name} (${result.slug})`);
  }

  console.log("\n🎉 Marketplace templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding templates:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
