/**
 * Seed Knowledge Graph
 *
 * Creates nodes and edges for:
 * - Roof types and materials
 * - Building code requirements
 * - Insurance carriers
 * - Damage types
 * - Relationships between entities
 *
 * Run: npx ts-node prisma/seeds/seedKnowledgeGraph.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedKnowledgeGraph() {
  console.log("🕸️  Seeding Knowledge Graph...");

  // 1. ROOF TYPES
  const roofTypes = [
    {
      type: "RoofType",
      name: "Asphalt Shingle",
      metadata: { commonSlopes: [4, 6, 8, 12], avgLifespan: 20 },
    },
    {
      type: "RoofType",
      name: "Metal Standing Seam",
      metadata: { commonSlopes: [3, 4, 6], avgLifespan: 50 },
    },
    {
      type: "RoofType",
      name: "Tile (Clay)",
      metadata: { commonSlopes: [4, 6, 8], avgLifespan: 50 },
    },
    {
      type: "RoofType",
      name: "Tile (Concrete)",
      metadata: { commonSlopes: [4, 6, 8], avgLifespan: 40 },
    },
    {
      type: "RoofType",
      name: "Flat/Low-Slope",
      metadata: { commonSlopes: [0, 1, 2], avgLifespan: 15 },
    },
  ];

  // 2. MATERIALS
  const materials = [
    {
      type: "Material",
      name: "Ice & Water Shield",
      metadata: { codeRequired: true, applications: ["valleys", "eaves", "penetrations"] },
    },
    {
      type: "Material",
      name: "Synthetic Underlayment",
      metadata: { codeRequired: true, minSlope: 2 },
    },
    {
      type: "Material",
      name: "Felt Underlayment (#30)",
      metadata: { codeRequired: true, legacy: true },
    },
    {
      type: "Material",
      name: "Drip Edge",
      metadata: { codeRequired: true, location: "eaves & rakes" },
    },
    {
      type: "Material",
      name: "Ridge Vent",
      metadata: { codeRequired: false, improves: "ventilation" },
    },
    {
      type: "Material",
      name: "Starter Shingles",
      metadata: { codeRequired: false, recommended: true },
    },
  ];

  // 3. CODE REQUIREMENTS
  const codes = [
    {
      type: "CodeRequirement",
      name: "IRC R905.2 - Underlayment Required",
      metadata: { section: "R905.2", applies: "all_roofs" },
    },
    {
      type: "CodeRequirement",
      name: "IRC R905.2.7 - Ice Barrier Required",
      metadata: { section: "R905.2.7", climateZones: [4, 5, 6, 7, 8] },
    },
    {
      type: "CodeRequirement",
      name: "IRC R905.2.8.5 - Fastener Requirements",
      metadata: { section: "R905.2.8.5", minNails: 4 },
    },
    {
      type: "CodeRequirement",
      name: "IRC R806 - Ventilation Required",
      metadata: { section: "R806", ratio: "1:150" },
    },
    {
      type: "CodeRequirement",
      name: "IRC R905.1.1 - Wind Resistance",
      metadata: { section: "R905.1.1", minRating: "Class D" },
    },
  ];

  // 4. CARRIERS
  const carriers = [
    {
      type: "Carrier",
      name: "State Farm",
      metadata: { marketShare: 0.16, avgProcessingDays: 18, preferences: ["code_citations"] },
    },
    {
      type: "Carrier",
      name: "Allstate",
      metadata: { marketShare: 0.09, avgProcessingDays: 21, preferences: ["detailed_photos"] },
    },
    {
      type: "Carrier",
      name: "Farmers",
      metadata: { marketShare: 0.07, avgProcessingDays: 19, preferences: ["manufacturer_specs"] },
    },
    {
      type: "Carrier",
      name: "USAA",
      metadata: { marketShare: 0.06, avgProcessingDays: 15, preferences: ["military_standards"] },
    },
    {
      type: "Carrier",
      name: "Liberty Mutual",
      metadata: { marketShare: 0.06, avgProcessingDays: 20, preferences: ["engineering_reports"] },
    },
    {
      type: "Carrier",
      name: "Travelers",
      metadata: { marketShare: 0.04, avgProcessingDays: 22, preferences: ["comparative_quotes"] },
    },
  ];

  // 5. DAMAGE TYPES
  const damageTypes = [
    {
      type: "DamageType",
      name: "Hail Impact",
      metadata: { evidenceRequired: ["test_square", "size_measurement"], avgCost: 12000 },
    },
    {
      type: "DamageType",
      name: "Wind Damage",
      metadata: { evidenceRequired: ["weather_data", "uplift_photos"], avgCost: 8500 },
    },
    {
      type: "DamageType",
      name: "Storm Damage (General)",
      metadata: { evidenceRequired: ["photos", "narrative"], avgCost: 10000 },
    },
    {
      type: "DamageType",
      name: "Age/Wear",
      metadata: { evidenceRequired: ["age_documentation", "condition_report"], avgCost: 15000 },
    },
    {
      type: "DamageType",
      name: "Structural Damage",
      metadata: { evidenceRequired: ["engineering_report"], avgCost: 25000 },
    },
  ];

  // Create all nodes
  console.log("  Creating nodes...");
  const nodeMap: Record<string, string> = {};

  for (const node of [...roofTypes, ...materials, ...codes, ...carriers, ...damageTypes]) {
    const created = await prisma.knowledgeNode.create({ data: node });
    nodeMap[node.name] = created.id;
    console.log(`    ✅ ${node.type}: ${node.name}`);
  }

  // Create edges (relationships)
  console.log("  Creating edges...");

  const edges = [
    // Roof Type -> Material Requirements
    { from: "Asphalt Shingle", to: "Ice & Water Shield", relation: "REQUIRES" },
    { from: "Asphalt Shingle", to: "Synthetic Underlayment", relation: "REQUIRES" },
    { from: "Asphalt Shingle", to: "Drip Edge", relation: "REQUIRES" },
    { from: "Metal Standing Seam", to: "Synthetic Underlayment", relation: "REQUIRES" },
    { from: "Tile (Clay)", to: "Felt Underlayment (#30)", relation: "REQUIRES" },
    { from: "Tile (Concrete)", to: "Felt Underlayment (#30)", relation: "REQUIRES" },

    // Materials -> Code Requirements
    {
      from: "Ice & Water Shield",
      to: "IRC R905.2.7 - Ice Barrier Required",
      relation: "SATISFIES",
    },
    {
      from: "Synthetic Underlayment",
      to: "IRC R905.2 - Underlayment Required",
      relation: "SATISFIES",
    },
    { from: "Drip Edge", to: "IRC R905.2 - Underlayment Required", relation: "ASSOCIATED_WITH" },

    // Damage Type -> Required Materials
    { from: "Hail Impact", to: "Asphalt Shingle", relation: "COMMONLY_AFFECTS" },
    { from: "Wind Damage", to: "Asphalt Shingle", relation: "COMMONLY_AFFECTS" },
    { from: "Wind Damage", to: "Metal Standing Seam", relation: "RARELY_AFFECTS" },

    // Carrier -> Preferred Evidence
    { from: "State Farm", to: "IRC R905.2 - Underlayment Required", relation: "PREFERS" },
    { from: "Allstate", to: "Hail Impact", relation: "FREQUENTLY_HANDLES" },
    { from: "USAA", to: "Wind Damage", relation: "FREQUENTLY_HANDLES" },

    // Code Requirements -> Roof Types
    { from: "IRC R905.2 - Underlayment Required", to: "Asphalt Shingle", relation: "APPLIES_TO" },
    {
      from: "IRC R905.2 - Underlayment Required",
      to: "Metal Standing Seam",
      relation: "APPLIES_TO",
    },
    { from: "IRC R905.2 - Underlayment Required", to: "Tile (Clay)", relation: "APPLIES_TO" },
    { from: "IRC R806 - Ventilation Required", to: "Asphalt Shingle", relation: "APPLIES_TO" },
  ];

  for (const edge of edges) {
    if (nodeMap[edge.from] && nodeMap[edge.to]) {
      await prisma.knowledgeEdge.create({
        data: {
          fromNodeId: nodeMap[edge.from],
          toNodeId: nodeMap[edge.to],
          relation: edge.relation,
          metadata: {},
        },
      });
      console.log(`    ✅ ${edge.from} ${edge.relation} ${edge.to}`);
    }
  }

  console.log("🎉 Knowledge graph seeded successfully!");
}

seedKnowledgeGraph()
  .catch((e) => {
    console.error("❌ Error seeding knowledge graph:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
