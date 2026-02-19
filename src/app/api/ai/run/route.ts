export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================================
// API: RUN AI ENGINE
// ============================================================================
// POST /api/ai/run
// Body: { reportId, engine, sectionKey?, context? }
// Returns: { jobId } or { jobIds: string[] }

import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

import { runSchema, validateAIRequest } from "@/lib/validation/aiSchemas";
import { validateQuota } from "@/modules/ai/core/tokens";
import { enqueue } from "@/modules/ai/jobs/queue";
import type { AISectionKey, AITokenBucket } from "@/modules/ai/types";

async function POST_INNER(req: NextRequest, ctx: { userId: string; orgId: string }) {
  try {
    const { userId, orgId } = ctx;

    const body = await req.json();
    const validation = validateAIRequest(runSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      );
    }
    const { reportId, engine, sectionKey, context } = validation.data;

    // Map engine to token bucket
    const bucketMap: Record<string, AITokenBucket> = {
      damageBuilder: "mockup",
      weather: "weather",
      codes: "dol",
      photoGrouping: "mockup",
    };

    // Run all engines if no specific engine provided
    if (!engine) {
      const engines = ["damageBuilder", "weather", "codes", "photoGrouping"];
      const jobIds: string[] = [];

      for (const eng of engines) {
        const bucket = bucketMap[eng];
        if (!bucket) continue;

        // Validate quota before enqueuing
        await validateQuota(userId, orgId || userId, bucket, 1);

        const jobId = await enqueue({
          reportId,
          engine: eng,
          sectionKey: eng as AISectionKey, // NOTE: Mapping handled by caller
          context,
        });
        jobIds.push(jobId);
      }

      return NextResponse.json({ jobIds });
    }

    // Run single engine
    const bucket = bucketMap[engine];
    if (!bucket) {
      return NextResponse.json({ error: `Unknown engine: ${engine}` }, { status: 400 });
    }

    // Validate quota
    await validateQuota(userId, orgId || userId, bucket, 1);

    const jobId = await enqueue({
      reportId,
      engine,
      sectionKey: sectionKey || engine,
      context,
    });

    return NextResponse.json({ jobId });
  } catch (error) {
    logger.error("[AI Run API]", error);
    return NextResponse.json({ error: error.message || "Failed to run AI" }, { status: 500 });
  }
}

export const POST = withAiBilling(createAiConfig("ai_run", { costPerRequest: 20 }), POST_INNER);
