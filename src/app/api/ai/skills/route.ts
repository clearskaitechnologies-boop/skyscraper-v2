/**
 * AI Skills API
 *
 * GET /api/ai/skills - Browse available AI capabilities
 *
 * Allows frontend to discover skills, filter by role/category,
 * and present them in UI as sellable features.
 */

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";
import {
  requireActiveSubscription,
  SubscriptionRequiredError,
} from "@/lib/billing/requireActiveSubscription";
import { checkRateLimit } from "@/lib/rate-limit";

import {
  AI_SKILLS,
  type AISkill,
  getSkillsByRole,
  getSkillStats,
  searchSkills,
} from "@/lib/ai/skills-registry";

async function GET_INNER(request: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId, orgId } = ctx;

    // ── Billing guard ──
    try {
      await requireActiveSubscription(orgId);
    } catch (error) {
      if (error instanceof SubscriptionRequiredError) {
        return NextResponse.json(
          { error: "subscription_required", message: "Active subscription required" },
          { status: 402 }
        );
      }
      throw error;
    }

    // ── Rate limit ──
    const rl = await checkRateLimit(userId, "AI");
    if (!rl.success) {
      return NextResponse.json(
        {
          error: "rate_limit_exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: rl.reset,
        },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)) },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as "Free" | "Pro" | "Admin" | null;
    const category = searchParams.get("category") as AISkill["category"] | null;
    const query = searchParams.get("query");
    const stats = searchParams.get("stats") === "true";

    // Return statistics
    if (stats) {
      return NextResponse.json({
        success: true,
        stats: getSkillStats(),
      });
    }

    let skills = Object.values(AI_SKILLS);

    // Filter by role
    if (role) {
      skills = getSkillsByRole(role);
    }

    // Filter by category
    if (category) {
      skills = skills.filter((skill) => skill.category === category);
    }

    // Search
    if (query) {
      skills = searchSkills(query);
    }

    return NextResponse.json({
      success: true,
      total: skills.length,
      skills: skills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        roleAccess: skill.roleAccess,
        estimatedTime: skill.estimatedTime,
        confidence: skill.confidence,
        tags: skill.tags,
        // Optionally include full details
        ...(searchParams.get("full") === "true" && {
          detailedDescription: skill.detailedDescription,
          idealInputs: skill.idealInputs,
          requiredInputs: skill.requiredInputs,
          outputs: skill.outputs,
          exampleUseCase: skill.exampleUseCase,
        }),
      })),
      filters: {
        availableRoles: ["Free", "Pro", "Admin"],
        availableCategories: ["damage", "workflow", "communication", "analysis", "estimation"],
      },
    });
  } catch (error) {
    logger.error("[AI Skills] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const GET = withAiBilling(createAiConfig("ai_skills", { costPerRequest: 10 }), GET_INNER);
