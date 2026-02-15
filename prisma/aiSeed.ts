// prisma/aiSeed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧠 Starting AI Intelligence Core seed...");

  // 1) Agents
  console.log("📋 Seeding agents...");
  const agents = [
    {
      name: "Claims Analyzer",
      description: "Analyzes claim context and surfaces next best actions.",
      goal: "Increase approval likelihood and reduce cycle time.",
      utilityModel: {
        weights: {
          approvalRate: 0.7,
          cycleTimeDays: 0.3,
        },
      },
    },
    {
      name: "Supplement Builder",
      description: "Identifies missed scope and builds supplements.",
      goal: "Increase paid amount ethically.",
      utilityModel: {
        weights: {
          supplementSuccessRate: 0.8,
          disputeRisk: -0.2,
        },
      },
    },
    {
      name: "Negotiation Strategist",
      description: "Suggests tactics and documentation to maximize approval odds.",
      goal: "Improve negotiation outcomes with carriers.",
      utilityModel: {
        weights: {
          negotiationWinRate: 0.9,
        },
      },
    },
  ];

  for (const a of agents) {
    await prisma.agent.upsert({
      where: { name: a.name },
      update: { description: a.description, goal: a.goal, utilityModel: a.utilityModel },
      create: a,
    });
  }
  console.log(`✅ Created ${agents.length} agents`);

  // 2) Basic knowledge graph (very minimal starter)
  console.log("🕸️  Seeding knowledge graph...");
  const shingleRoof = await prisma.knowledgeNode.upsert({
    where: { name: "RoofType: Shingle" },
    update: {},
    create: {
      type: "RoofType",
      name: "RoofType: Shingle",
      metadata: {},
    },
  });

  const dripEdgeReq = await prisma.knowledgeNode.upsert({
    where: { name: "CodeRequirement: DripEdge" },
    update: {},
    create: {
      type: "CodeRequirement",
      name: "CodeRequirement: DripEdge",
      metadata: { citation: "IRC R905.2.8.5 (example, verify local)" },
    },
  });

  await prisma.knowledgeEdge.upsert({
    where: {
      // crude unique: from+to+relation in one string
      id: `${shingleRoof.id}_${dripEdgeReq.id}_REQUIRES`,
    },
    update: {},
    create: {
      id: `${shingleRoof.id}_${dripEdgeReq.id}_REQUIRES`,
      fromNodeId: shingleRoof.id,
      toNodeId: dripEdgeReq.id,
      relation: "REQUIRES",
      metadata: {},
    },
  });
  console.log("✅ Created knowledge graph (roof → drip edge requirement)");

  // 3) Some starter rules
  console.log("📜 Seeding rules...");
  await prisma.rule.upsert({
    where: { name: "Require drip edge on shingle roofs" },
    update: {},
    create: {
      name: "Require drip edge on shingle roofs",
      description: "If roofType is shingle, recommend including drip edge in scope.",
      trigger: {
        all: [{ path: "roof.type", op: "==", value: "shingle" }],
      },
      action: {
        type: "ADD_SCOPE_RECOMMENDATION",
        payload: {
          lineItemCode: "DRIP_EDGE",
          reason: "Code requirement for shingle roof edges in many jurisdictions.",
        },
      },
    },
  });
  console.log("✅ Created 1 rule");

  // 4) Negotiation strategies (example carriers)
  console.log("🎯 Seeding negotiation strategies...");
  const strategies = [
    {
      carrier: "State Farm",
      pattern: {
        notes: "Often strict on code justification; respond well to clear citations + photos.",
      },
      recommendedActions: {
        steps: [
          "Attach at least 6–10 clear, labeled photos (eaves, rakes, valleys).",
          "Include verbatim code citations for drip edge, ice/water shield if applicable.",
          "Provide a short, bullet-point explanation of why each disputed line is required.",
        ],
      },
      utilityBoost: 0.18,
    },
    {
      carrier: "Allstate",
      pattern: {
        notes:
          "Frequently disputes overhead & profit; respond well to historical invoices and complexity explanation.",
      },
      recommendedActions: {
        steps: [
          "Document job complexity (multi-trade, steep, multi-story).",
          "Attach one or two historical invoices showing O&P norm in your market.",
          "Explain risk of job abandonment / contractor churn without proper O&P.",
        ],
      },
      utilityBoost: 0.22,
    },
  ];

  for (const s of strategies) {
    await prisma.negotiationStrategy.upsert({
      where: { carrier: s.carrier },
      update: {
        pattern: s.pattern,
        recommendedActions: s.recommendedActions,
        utilityBoost: s.utilityBoost,
      },
      create: s,
    });
  }
  console.log(`✅ Created ${strategies.length} negotiation strategies`);

  console.log("\n✅ AI intelligence seed complete.");
  console.log("\n📊 Summary:");
  console.log(`   - ${agents.length} AI agents`);
  console.log(`   - 2 knowledge nodes + 1 edge`);
  console.log(`   - 1 rule`);
  console.log(`   - ${strategies.length} carrier strategies`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
