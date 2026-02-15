/**
 * Seed Initial AI Agents
 *
 * Creates the core agents that power SkaiScraper's intelligence:
 * - EstimateAgent: Generates accurate estimates
 * - AppealAgent: Writes compelling appeal letters
 * - SupplementAgent: Creates supplement documentation
 * - NegotiationAgent: Advises on carrier negotiations
 * - PlannerAgent: Recommends next actions
 * - RiskAnalysisAgent: Identifies high-risk claims
 *
 * Run: npx ts-node prisma/seeds/seedAgents.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAgents() {
  console.log("🤖 Seeding AI Agents...");

  const agents = [
    {
      name: "EstimateAgent",
      description: "Generates comprehensive, code-compliant estimates using AI Claims Builder",
      goal: "Maximize estimate accuracy while ensuring carrier approval likelihood",
      utilityModel: {
        weights: {
          accuracy: 0.35,
          completeness: 0.25,
          approvalRate: 0.25,
          speed: 0.15,
        },
        thresholds: {
          minAccuracy: 0.85,
          minCompleteness: 0.9,
        },
        optimizationTarget: "approval_rate",
      },
    },
    {
      name: "AppealAgent",
      description: "Writes persuasive appeal and supplement letters with code citations",
      goal: "Overturn denials and secure supplements through compelling arguments",
      utilityModel: {
        weights: {
          persuasiveness: 0.4,
          codeCompliance: 0.3,
          successRate: 0.2,
          responseTime: 0.1,
        },
        thresholds: {
          minCodeCitations: 3,
          minPhotoReferences: 2,
        },
        optimizationTarget: "overturn_rate",
      },
    },
    {
      name: "SupplementAgent",
      description: "Prepares supplement documentation with justifications and evidence",
      goal: "Secure approval for additional scope items through thorough documentation",
      utilityModel: {
        weights: {
          justificationQuality: 0.35,
          evidenceCompleteness: 0.3,
          approvalRate: 0.25,
          amountSecured: 0.1,
        },
        thresholds: {
          minJustificationLength: 200,
          minPhotoCount: 5,
        },
        optimizationTarget: "supplement_approval_rate",
      },
    },
    {
      name: "NegotiationAgent",
      description: "Provides carrier-specific negotiation strategies and tactics",
      goal: "Maximize final payout through strategic carrier interactions",
      utilityModel: {
        weights: {
          payoutIncrease: 0.4,
          carrierSatisfaction: 0.25,
          timeToResolution: 0.2,
          relationshipPreservation: 0.15,
        },
        thresholds: {
          minPayoutIncrease: 0.05,
          maxNegotiationRounds: 3,
        },
        optimizationTarget: "payout_increase",
      },
    },
    {
      name: "PlannerAgent",
      description: "Recommends optimal next actions based on claim state and patterns",
      goal: "Guide users through most efficient claim workflow",
      utilityModel: {
        weights: {
          timeToCompletion: 0.35,
          approvalLikelihood: 0.3,
          userSatisfaction: 0.2,
          costEfficiency: 0.15,
        },
        thresholds: {
          minConfidence: 0.7,
          maxActionsPerState: 5,
        },
        optimizationTarget: "cycle_time",
      },
    },
    {
      name: "RiskAnalysisAgent",
      description: "Identifies high-risk claims and recommends preventive actions",
      goal: "Reduce denials and delays through early risk detection",
      utilityModel: {
        weights: {
          denialPredictionAccuracy: 0.4,
          earlyWarningValue: 0.3,
          falsePositiveRate: 0.2,
          preventionSuccess: 0.1,
        },
        thresholds: {
          minRiskThreshold: 0.6,
          maxFalsePositiveRate: 0.15,
        },
        optimizationTarget: "denial_prevention",
      },
    },
  ];

  for (const agent of agents) {
    const created = await prisma.agent.upsert({
      where: { name: agent.name },
      update: agent,
      create: agent,
    });
    console.log(`  ✅ ${created.name}`);
  }

  console.log("🎉 Agents seeded successfully!");
}

seedAgents()
  .catch((e) => {
    console.error("❌ Error seeding agents:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
