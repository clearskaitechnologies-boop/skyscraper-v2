/**
 * REPORT TEMPLATES SEED
 *
 * Seeds 2 complete system templates:
 * 1. Insurance Carrier Friendly (conservative, adjuster-aligned)
 * 2. Contractor Advocacy & Supplements (evidence-heavy, defense-focused)
 *
 * Each template includes all 13 sections with appropriate variants.
 */

import { PrismaClient } from "@prisma/client";

import { REPORT_SECTIONS } from "../src/lib/reports/templateSections";

const prisma = new PrismaClient();

export async function seedReportTemplates(orgId: string) {
  console.log("📄 Seeding report templates...");

  // Template 1: Insurance Carrier Friendly
  const carrierTemplate = await prisma.report_templates.create({
    data: {
      id: `tpl_carrier_${Date.now()}`,
      orgId,
      name: "Insurance Carrier Friendly",
      description:
        "Standardized carrier-aligned reporting with conservative framing. Ideal for adjuster submissions and claim documentation.",
      isDefault: true,
      templateType: "SYSTEM",
      sectionOrder: JSON.stringify(REPORT_SECTIONS.map((s) => s.sectionKey)),
      sectionEnabled: JSON.stringify(
        REPORT_SECTIONS.reduce((acc, s) => ({ ...acc, [s.sectionKey]: true }), {})
      ),
      defaults: JSON.stringify({
        tone: "neutral",
        audience: "adjuster",
      }),
      createdBy: "system",
    },
  });

  // Create sections for carrier template
  const carrierSections = [
    { key: "cover", variant: "logo-header", order: 0 },
    { key: "toc", variant: "auto", order: 1 },
    {
      key: "executive-summary",
      variant: "neutral-ai",
      order: 2,
      aiInstructions:
        "Summarize findings objectively. Avoid advocacy language. Present facts neutrally.",
    },
    {
      key: "weather-verification",
      variant: "storm-timeline",
      order: 3,
      aiInstructions:
        "Present weather data chronologically with high confidence. Cite NOAA and VisualCrossing sources.",
    },
    {
      key: "adjuster-notes",
      variant: "chronological",
      order: 4,
      aiInstructions: "Present notes in chronological order without interpretation.",
    },
    {
      key: "photo-evidence",
      variant: "grid-labeled",
      order: 5,
      aiInstructions:
        "Label photos clearly with damage type tags. Do not assess severity or interpret findings.",
    },
    {
      key: "test-cuts",
      variant: "table",
      order: 6,
      aiInstructions: "Present measurements in clean tabular format with locations.",
    },
    {
      key: "scope-matrix",
      variant: "xactimate-style",
      order: 7,
      aiInstructions: "Use familiar Xactimate line-item format for adjuster review.",
    },
    {
      key: "code-compliance",
      variant: "jurisdiction-first",
      order: 8,
      aiInstructions: "Cite local building codes. Use plain language for code explanations.",
    },
    {
      key: "pricing-comparison",
      variant: "regional-average",
      order: 9,
      aiInstructions: "Compare to regional market averages. Present pricing objectively.",
    },
    {
      key: "supplements",
      variant: "delta-only",
      order: 10,
      aiInstructions: "Show only changes from original estimate. Brief justifications.",
    },
    {
      key: "signature-page",
      variant: "digital-signature",
      order: 11,
      aiInstructions: "Standard signature block with date and title fields.",
    },
    {
      key: "attachments-index",
      variant: "auto",
      order: 12,
      aiInstructions: "Auto-generate attachment index from uploaded documents.",
    },
  ];

  for (const section of carrierSections) {
    const sectionDef = REPORT_SECTIONS.find((s) => s.sectionKey === section.key);
    if (!sectionDef) continue;

    await prisma.report_template_sections.create({
      data: {
        id: `sec_${carrierTemplate.id}_${section.key}`,
        templateId: carrierTemplate.id,
        sectionKey: section.key,
        title: sectionDef.defaultTitle,
        order: section.order,
        layoutVariant: section.variant,
        placeholders: JSON.stringify(sectionDef.placeholders),
        aiInstructions: section.aiInstructions || null,
        enabled: true,
      },
    });
  }

  console.log(`  ✓ Created: ${carrierTemplate.name}`);

  // Template 2: Contractor Advocacy & Supplements
  const advocacyTemplate = await prisma.report_templates.create({
    data: {
      id: `tpl_advocacy_${Date.now()}`,
      orgId,
      name: "Contractor Advocacy & Supplements",
      description:
        "Evidence-heavy, code-driven, rejection-resistant report layout. Optimized for supplements and carrier rebuttals.",
      isDefault: false,
      templateType: "SYSTEM",
      sectionOrder: JSON.stringify(REPORT_SECTIONS.map((s) => s.sectionKey)),
      sectionEnabled: JSON.stringify(
        REPORT_SECTIONS.reduce((acc, s) => ({ ...acc, [s.sectionKey]: true }), {})
      ),
      defaults: JSON.stringify({
        tone: "advocacy",
        audience: "carrier",
        emphasis: "code-compliance",
      }),
      createdBy: "system",
    },
  });

  // Create sections for advocacy template
  const advocacySections = [
    { key: "cover", variant: "full-hero-photo", order: 0 },
    { key: "toc", variant: "auto", order: 1 },
    {
      key: "executive-summary",
      variant: "advocacy-ai",
      order: 2,
      aiInstructions:
        "Clearly state underpayment, scope gaps, and repair justification. Use evidence-driven language.",
    },
    {
      key: "weather-verification",
      variant: "multi-source-verification",
      order: 3,
      aiInstructions:
        "Cross-reference multiple weather sources. Establish high-confidence storm correlation.",
    },
    {
      key: "adjuster-notes",
      variant: "side-by-side",
      order: 4,
      aiInstructions:
        "Compare adjuster vs contractor perspectives. Highlight discrepancies clearly.",
    },
    {
      key: "photo-evidence",
      variant: "room-by-room",
      order: 5,
      aiInstructions:
        "Organize photos by room/location. Comprehensive damage documentation with detailed captions.",
    },
    {
      key: "test-cuts",
      variant: "annotated-photos",
      order: 6,
      aiInstructions: "Use annotated photos showing measurements and findings. Visual emphasis.",
    },
    {
      key: "scope-matrix",
      variant: "repair-vs-replace",
      order: 7,
      aiInstructions:
        "Show repair vs replace analysis. Justify replacement when necessary with code references.",
    },
    {
      key: "code-compliance",
      variant: "manufacturer-first",
      order: 8,
      aiInstructions:
        "Lead with manufacturer requirements. Cite codes that mandate compliance. Explain non-compliance clearly.",
    },
    {
      key: "pricing-comparison",
      variant: "supplier-quotes",
      order: 9,
      aiInstructions:
        "Show actual supplier quotes. Document pricing justification with real market data.",
    },
    {
      key: "supplements",
      variant: "timeline",
      order: 10,
      aiInstructions:
        "Show supplement timeline with change justifications. Reference photos and codes for each change.",
    },
    {
      key: "signature-page",
      variant: "affidavit",
      order: 11,
      aiInstructions: "Legal affidavit format with detailed disclaimers.",
    },
    {
      key: "attachments-index",
      variant: "manual",
      order: 12,
      aiInstructions: "Manually curated attachment list emphasizing key evidence documents.",
    },
  ];

  for (const section of advocacySections) {
    const sectionDef = REPORT_SECTIONS.find((s) => s.sectionKey === section.key);
    if (!sectionDef) continue;

    await prisma.report_template_sections.create({
      data: {
        id: `sec_${advocacyTemplate.id}_${section.key}`,
        templateId: advocacyTemplate.id,
        sectionKey: section.key,
        title: sectionDef.defaultTitle,
        order: section.order,
        layoutVariant: section.variant,
        placeholders: JSON.stringify(sectionDef.placeholders),
        aiInstructions: section.aiInstructions || null,
        enabled: true,
      },
    });
  }

  console.log(`  ✓ Created: ${advocacyTemplate.name}`);
  console.log(`📄 Report templates seeded successfully!\n`);

  return {
    carrierTemplate,
    advocacyTemplate,
  };
}

/**
 * Standalone execution (for testing)
 */
async function main() {
  console.log("🌱 Seeding report templates (standalone)...\n");

  // Use first org or create demo org
  let org = await prisma.org.findFirst();

  if (!org) {
    console.log("Creating demo organization...");
    org = await prisma.org.create({
      data: {
        id: randomUUID(),
        name: "Demo Organization",
        clerkOrgId: `org_demo_${Date.now()}`,
        updatedAt: new Date(),
      },
    });
  }

  await seedReportTemplates(org.id);

  console.log("✅ Done!");
}

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error("❌ Error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

function randomUUID() {
  return require("crypto").randomUUID();
}
