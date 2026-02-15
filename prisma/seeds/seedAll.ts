/**
 * Master Seed Script - AI Intelligence Core
 *
 * Runs all seed scripts in correct order:
 * 1. Agents
 * 2. Rules
 * 3. Knowledge Graph
 * 4. Negotiation Strategies
 *
 * Run: npx ts-node prisma/seeds/seedAll.ts
 */

import { execSync } from "child_process";
import * as path from "path";

const seeds = [
  "seedAgents.ts",
  "seedRules.ts",
  "seedKnowledgeGraph.ts",
  "seedNegotiationStrategies.ts",
];

async function runAllSeeds() {
  console.log("🌱 Starting AI Intelligence Core Seeding...\n");

  for (const seed of seeds) {
    const seedPath = path.join(__dirname, seed);
    console.log(`\n📦 Running ${seed}...`);

    try {
      execSync(`npx ts-node ${seedPath}`, { stdio: "inherit" });
    } catch (error) {
      console.error(`\n❌ Error running ${seed}:`, error);
      process.exit(1);
    }
  }

  console.log("\n✨ All seeds completed successfully!\n");
  console.log("📊 Seeded:");
  console.log("  - 6 AI Agents");
  console.log("  - 15 Business Rules");
  console.log("  - 25+ Knowledge Graph Nodes");
  console.log("  - 15+ Knowledge Graph Edges");
  console.log("  - 8 Carrier Negotiation Strategies");
  console.log("\n🚀 AI Intelligence Core is ready!\n");
}

runAllSeeds();
