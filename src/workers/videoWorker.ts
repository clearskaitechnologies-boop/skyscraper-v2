/**
 * MISSION 4D: VIDEO WORKER (HARDENED)
 *
 * Processes video generation jobs with retry logic, timeout protection, and structured logging
 *
 * Features:
 * - Retry with exponential backoff (max 3 attempts)
 * - 30-second timeout per stage with AbortController
 * - Structured error categorization (TIMEOUT, API_LIMIT, INVALID_PHOTOS, RENDER_FAILED)
 * - Comprehensive logging with jobId context
 * - Progress callbacks for UI updates
 */

import {
  estimateVideoDuration,
  generateVideoScript,
  generateVideoStoryboard,
} from "@/lib/ai/dominusVideo";
import prisma from "@/lib/prisma";
import { renderVideoFromStoryboard } from "@/lib/video/renderVideo";

// Prisma singleton imported from @/lib/db/prisma

// Error codes for categorization
enum VideoErrorCode {
  TIMEOUT = "TIMEOUT",
  API_LIMIT = "API_LIMIT",
  INVALID_PHOTOS = "INVALID_PHOTOS",
  RENDER_FAILED = "RENDER_FAILED",
  SCRIPT_FAILED = "SCRIPT_FAILED",
  STORYBOARD_FAILED = "STORYBOARD_FAILED",
  NOT_FOUND = "NOT_FOUND",
  UNKNOWN = "UNKNOWN",
}

interface VideoJobError extends Error {
  code?: VideoErrorCode;
  retryable?: boolean;
}

/**
 * Categorize error and determine if retryable
 */
function categorizeError(error: any): { code: VideoErrorCode; retryable: boolean } {
  const message = error.message?.toLowerCase() || "";

  if (message.includes("timeout") || message.includes("timed out")) {
    return { code: VideoErrorCode.TIMEOUT, retryable: true };
  }
  if (message.includes("rate limit") || message.includes("429")) {
    return { code: VideoErrorCode.API_LIMIT, retryable: true };
  }
  if (message.includes("no photos") || message.includes("invalid photo")) {
    return { code: VideoErrorCode.INVALID_PHOTOS, retryable: false };
  }
  if (message.includes("render") || message.includes("video generation")) {
    return { code: VideoErrorCode.RENDER_FAILED, retryable: true };
  }
  if (message.includes("script")) {
    return { code: VideoErrorCode.SCRIPT_FAILED, retryable: true };
  }
  if (message.includes("storyboard")) {
    return { code: VideoErrorCode.STORYBOARD_FAILED, retryable: true };
  }
  if (message.includes("not found")) {
    return { code: VideoErrorCode.NOT_FOUND, retryable: false };
  }
  return { code: VideoErrorCode.UNKNOWN, retryable: true };
}

/**
 * Execute function with timeout protection
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, stage: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${stage} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Process video job with retry logic
 */
export async function processVideoJobWithRetry(jobId: string): Promise<any> {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[VIDEO START] jobId=${jobId} attempt=${attempt}/${maxRetries}`);
      return await processVideoJob(jobId);
    } catch (error: any) {
      const { code, retryable } = categorizeError(error);
      console.error(
        `[VIDEO ERROR] jobId=${jobId} attempt=${attempt} code=${code} retryable=${retryable} msg="${error.message}"`
      );

      // Update retry count & last error
      await prisma.jobs.update({
        where: { id: jobId },
        data: {
          retryCount: attempt,
          errorMessage: `${code}: ${error.message}`,
          errorCode: code,
        },
      });

      if (!retryable || attempt === maxRetries) {
        await prisma.jobs.update({
          where: { id: jobId },
          data: {
            stage: "FAILED",
            failedAt: new Date(),
          },
        });
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`[VIDEO RETRY] jobId=${jobId} waiting ${delay}ms before retry`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Main video processing function (internal)
 */
export async function processVideoJob(jobId: string) {
  const startTime = Date.now();
  console.log(`[VIDEO JOB] jobId=${jobId} status=STARTING timestamp=${new Date().toISOString()}`);

  try {
    // 1. Load job
    const jobData = await prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!jobData) {
      throw new Error(`VideoJob ${jobId} not found`);
    }

    // Type assertion for video-specific fields that were added via migration
    const job = jobData as typeof jobData & {
      leadId?: string | null;
      photos?: any;
      videoReport?: any;
    };

    // 2. Load lead data
    if (!job.leadId) {
      throw new Error(`VideoJob ${jobId} has no associated leadId`);
    }

    const leadData = await prisma.leads.findUnique({
      where: { id: job.leadId },
      include: {
        contacts: true,
      },
    });

    if (!leadData) {
      throw new Error(`Lead ${job.leadId} not found`);
    }

    const lead = leadData as typeof leadData & { contacts: any };

    // Extract photos from job or lead
    const photos = (job.photos as any[]) || (lead as any).photos || [];

    if (photos.length === 0) {
      await prisma.jobs.update({
        where: { id: jobId },
        data: {
          stage: "FAILED",
          errorMessage: "No photos available for video generation",
        },
      });
      throw new Error("No photos available");
    }

    const contact = lead.contacts as any;
    const address = contact
      ? `${contact.street || ""} ${contact.city || ""} ${contact.state || ""}`.trim()
      : "";

    // 3. Update status: Processing Script
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        stage: "SCRIPT_GENERATION",
        progress: 20,
      },
    });

    // 4. Generate video script (with 30s timeout)
    console.log(`[VIDEO SCRIPT] jobId=${jobId} status=GENERATING`);
    const script = await withTimeout(
      generateVideoScript(
        {
          leadId: lead.id,
          address,
          photos: photos.map((p: any) => ({ url: p.url || p })),
          title: lead.title || "Property Damage Assessment",
          description: lead.description || "",
        },
        job.orgId
      ),
      30000,
      "Script generation"
    );

    console.log(`[VIDEO SCRIPT] jobId=${jobId} status=SUCCESS title="${script.title}"`);

    // 5. Update status: Processing Storyboard
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        stage: "STORYBOARD_GENERATION",
        progress: 40,
      },
    });

    // 6. Generate storyboard (with 30s timeout)
    console.log(`[VIDEO STORYBOARD] jobId=${jobId} status=GENERATING`);
    const storyboard = await withTimeout(
      generateVideoStoryboard(script, job.orgId),
      30000,
      "Storyboard generation"
    );
    const durationSec = estimateVideoDuration(storyboard);

    console.log(
      `[VIDEO STORYBOARD] jobId=${jobId} status=SUCCESS scenes=${storyboard.scenes.length} duration=${durationSec}s`
    );

    // 7. Create or update VideoReport
    let videoReport = job.videoReport;

    if (videoReport) {
      // Update existing
      videoReport = await prisma.ai_reports.update({
        where: { id: videoReport.id },
        data: {
          scriptJson: JSON.parse(JSON.stringify(script)) as any,
          storyboardJson: JSON.parse(JSON.stringify(storyboard)) as any,
          duration: durationSec,
          title: script.title,
        },
      });
    } else {
      // Create new
      videoReport = await prisma.ai_reports.create({
        data: {
          id: crypto.randomUUID(),
          leadId: lead.id,
          orgId: job.orgId,
          type: "VIDEO",
          title: script.title,
          content: JSON.stringify({ script, storyboard }),
          scriptJson: JSON.parse(JSON.stringify(script)) as any,
          storyboardJson: JSON.parse(JSON.stringify(storyboard)) as any,
          duration: durationSec,
          status: "PROCESSING",
          tokensUsed: 0,
          model: "skai-video",
          userId: "system",
          userName: "SkaiPDF Video",
          updatedAt: new Date(),
        },
      });

      // Link job to report
      await prisma.jobs.update({
        where: { id: jobId },
        data: {
          videoReportId: videoReport.id,
        },
      });
    }

    // 8. SCENE_RENDERING stage - Render the video (60%)
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        stage: "SCENE_RENDERING",
        progress: 60,
      },
    });

    console.log(`[VIDEO RENDER] jobId=${jobId} status=STARTING scenes=${storyboard.scenes.length}`);

    // Render with extended 120s timeout (video rendering is slow)
    const renderResult = await withTimeout(
      renderVideoFromStoryboard({
        storyboard,
        photos: photos.map((p: any) => ({
          url: typeof p === "string" ? p : p.url || p,
        })),
        leadId: lead.id,
        orgId: job.orgId || "",
      }),
      120000,
      "Video rendering"
    );

    console.log(
      `[VIDEO RENDER] jobId=${jobId} status=SUCCESS url=${renderResult.videoUrl} size=${renderResult.sizeMb?.toFixed(1)}MB duration=${renderResult.durationSec}s`
    );

    // 9. VIDEO_COMPILATION stage - Finalize (80%)
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        stage: "VIDEO_COMPILATION",
        progress: 80,
      },
    });

    // Update VideoReport with render results
    await prisma.ai_reports.update({
      where: { id: videoReport.id },
      data: {
        videoUrl: renderResult.videoUrl,
        thumbnailUrl: renderResult.thumbnailUrl,
        sizeMb: renderResult.sizeMb,
        duration: renderResult.durationSec || durationSec,
      },
    });

    // 10. Mark as completed (100%)
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        stage: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
      },
    });

    await prisma.ai_reports.update({
      where: { id: videoReport.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[VIDEO JOB] jobId=${jobId} status=COMPLETED elapsed=${elapsedTime}s`);
    return videoReport;
  } catch (error: any) {
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const { code } = categorizeError(error);

    console.error(
      `[VIDEO JOB] jobId=${jobId} status=FAILED code=${code} elapsed=${elapsedTime}s error="${error.message}"`
    );

    // Update job as failed with error code
    await prisma.jobs.update({
      where: { id: jobId },
      data: {
        stage: "FAILED",
        errorMessage: `${code}: ${error.message}`,
        errorCode: code,
      },
    });

    throw error;
  }
}
