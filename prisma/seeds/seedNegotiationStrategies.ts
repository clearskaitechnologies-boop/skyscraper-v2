/**
 * Seed Negotiation Strategies
 *
 * Creates carrier-specific negotiation tactics based on:
 * - Historical approval patterns
 * - Carrier preferences
 * - Regional variations
 * - Proven successful approaches
 *
 * Run: npx ts-node prisma/seeds/seedNegotiationStrategies.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedNegotiationStrategies() {
  console.log("💼 Seeding Negotiation Strategies...");

  const strategies = [
    {
      carrier: "State Farm",
      pattern: {
        summary: "State Farm responds best to code citations and manufacturer specifications",
        denialPatterns: ["price disputes", "scope disagreements", "age/wear claims"],
        approvalFactors: ["IRC citations", "HAAG certifications", "manufacturer install specs"],
        avgResponseDays: 18,
        negotiationSuccess: 0.73,
        riskLevel: "low",
      },
      recommendedActions: {
        steps: [
          "Include IRC section references in narrative",
          "Attach manufacturer installation instructions",
          "Provide 3-angle photos of damaged areas",
          "Reference local building department requirements",
          "Use technical terminology consistently",
        ],
        templates: ["state_farm_appeal", "state_farm_supplement"],
        timing: "Submit between 8am-2pm EST for faster review",
      },
      utilityBoost: 0.18,
    },
    {
      carrier: "Allstate",
      pattern: {
        summary: "Allstate requires extensive photo documentation and detailed measurements",
        denialPatterns: ["insufficient photos", "measurement disputes", "material matching"],
        approvalFactors: ["annotated photos", "detailed measurements", "comparative quotes"],
        avgResponseDays: 21,
        negotiationSuccess: 0.68,
        riskLevel: "medium",
      },
      recommendedActions: {
        steps: [
          "Provide minimum 8 annotated photos",
          "Include close-up and wide-angle views",
          "Add detailed measurements with diagrams",
          "Submit 2-3 material quotes from local suppliers",
          "Document all pre-existing conditions clearly",
        ],
        templates: ["allstate_supplement", "allstate_photo_package"],
        timing: "Allow 3-4 weeks for initial review",
      },
      utilityBoost: 0.15,
    },
    {
      carrier: "Farmers",
      pattern: {
        summary: "Farmers values manufacturer specs and industry standards",
        denialPatterns: ["installation method disputes", "material grade issues"],
        approvalFactors: ["manufacturer specs", "NRCA standards", "warranty requirements"],
        avgResponseDays: 19,
        negotiationSuccess: 0.71,
        riskLevel: "low",
      },
      recommendedActions: {
        steps: [
          "Attach manufacturer installation manuals",
          "Reference NRCA/ARMA standards",
          "Explain warranty implications of proper installation",
          "Include material grade specifications",
          "Provide installer certifications if available",
        ],
        templates: ["farmers_technical_supplement"],
        timing: "Follow up after 2 weeks if no response",
      },
      utilityBoost: 0.16,
    },
    {
      carrier: "USAA",
      pattern: {
        summary: "USAA appreciates military-style precision and engineering rigor",
        denialPatterns: ["scope questions", "necessity disputes"],
        approvalFactors: [
          "engineering reports",
          "systematic documentation",
          "clear cost breakdown",
        ],
        avgResponseDays: 15,
        negotiationSuccess: 0.78,
        riskLevel: "low",
      },
      recommendedActions: {
        steps: [
          "Provide systematic, organized documentation",
          "Include engineering analysis if >$30k",
          "Use clear, concise military-style language",
          "Break down costs into logical categories",
          "Show clear cause-and-effect relationships",
        ],
        templates: ["usaa_engineering_supplement", "usaa_organized_appeal"],
        timing: "Fastest response time - expect reply within 2 weeks",
      },
      utilityBoost: 0.21,
    },
    {
      carrier: "Liberty Mutual",
      pattern: {
        summary: "Liberty Mutual values engineering reports and third-party validation",
        denialPatterns: ["structural concerns", "extent of damage disputes"],
        approvalFactors: ["engineering reports", "expert opinions", "testing results"],
        avgResponseDays: 20,
        negotiationSuccess: 0.69,
        riskLevel: "medium",
      },
      recommendedActions: {
        steps: [
          "Consider engineering inspection for claims >$40k",
          "Provide third-party validation when possible",
          "Include material testing results if applicable",
          "Document structural implications clearly",
          "Use expert testimony to support scope",
        ],
        templates: ["liberty_engineering_report", "liberty_expert_supplement"],
        timing: "Engineering reports expedite approval by 7-10 days",
      },
      utilityBoost: 0.17,
    },
    {
      carrier: "Travelers",
      pattern: {
        summary: "Travelers responds well to comparative market analysis and competitive quotes",
        denialPatterns: ["pricing disputes", "material cost disagreements"],
        approvalFactors: ["comparative quotes", "market analysis", "prevailing wage data"],
        avgResponseDays: 22,
        negotiationSuccess: 0.65,
        riskLevel: "medium",
      },
      recommendedActions: {
        steps: [
          "Provide 2-3 competitive quotes from local suppliers",
          "Include prevailing wage documentation",
          "Show regional market pricing trends",
          "Document material availability and lead times",
          "Explain price differences with data",
        ],
        templates: ["travelers_market_analysis", "travelers_price_justification"],
        timing: "Price disputes take 3-4 weeks to resolve",
      },
      utilityBoost: 0.12,
    },
    {
      carrier: "Nationwide",
      pattern: {
        summary: "Nationwide appreciates detailed narratives and comprehensive explanations",
        denialPatterns: ["insufficient explanation", "vague descriptions"],
        approvalFactors: ["detailed narratives", "step-by-step justifications", "clear reasoning"],
        avgResponseDays: 23,
        negotiationSuccess: 0.67,
        riskLevel: "medium",
      },
      recommendedActions: {
        steps: [
          "Write comprehensive, detailed narratives",
          'Explain the "why" for every line item',
          "Use clear, logical progression in arguments",
          "Anticipate and address potential objections",
          "Provide context for all decisions",
        ],
        templates: ["nationwide_detailed_supplement"],
        timing: "Allow extra time for review - be thorough upfront",
      },
      utilityBoost: 0.14,
    },
    {
      carrier: "American Family",
      pattern: {
        summary: "American Family values regional expertise and local knowledge",
        denialPatterns: ["local code disputes", "regional material questions"],
        approvalFactors: ["local building dept letters", "regional standards", "area expertise"],
        avgResponseDays: 19,
        negotiationSuccess: 0.7,
        riskLevel: "low",
      },
      recommendedActions: {
        steps: [
          "Reference local building department requirements",
          "Include regional code variations",
          "Explain area-specific climate considerations",
          "Cite local contractor standards",
          "Demonstrate regional expertise",
        ],
        templates: ["amfam_local_standards"],
        timing: "Regional adjusters respond faster - 2-3 weeks",
      },
      utilityBoost: 0.15,
    },
  ];

  for (const strategy of strategies) {
    const created = await prisma.negotiationStrategy.upsert({
      where: { carrier: strategy.carrier },
      update: {
        pattern: strategy.pattern,
        recommendedActions: strategy.recommendedActions,
        utilityBoost: strategy.utilityBoost,
      },
      create: strategy,
    });
    console.log(
      `  ✅ ${created.carrier} (${Math.round((strategy.utilityBoost || 0) * 100)}% boost)`
    );
  }

  console.log("🎉 Negotiation strategies seeded successfully!");
}

seedNegotiationStrategies()
  .catch((e) => {
    console.error("❌ Error seeding negotiation strategies:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
