import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { errors, ok, withErrorHandler } from "@/lib/api/response";
import { getRateLimitIdentifier, rateLimiters } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/ai/mockup
 * Generate AI-powered property mockup with new roof
 *
 * STATUS: Feature temporarily disabled - requires Replicate/Stability AI integration
 */
async function handlePOST(req: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return errors.unauthorized();
  }

  // Rate limiting check (10 requests per minute for AI endpoints)
  const identifier = getRateLimitIdentifier(user.id, req);
  const allowed = await rateLimiters.ai.check(10, identifier);

  if (!allowed) {
    return errors.tooManyRequests();
  }

  const body = await req.json();
  const { imageUrl, address, prompt, material, color } = body;

  if (!imageUrl) {
    return errors.badRequest("Image URL is required.");
  }

  // Check if Replicate API is configured
  const isConfigured = !!process.env.REPLICATE_API_TOKEN || !!process.env.STABILITY_API_KEY;

  if (!isConfigured) {
    // Graceful disable - return original image with clear messaging
    return ok({
      mockupUrl: imageUrl,
      original: imageUrl,
      address,
      isDisabled: true,
      message:
        "AI mockup generation is temporarily disabled. Requires Replicate or Stability AI API configuration.",
      note: "This feature will visualize your roof with selected materials and colors once enabled.",
      requestedOptions: {
        material,
        color,
        prompt,
      },
    });
  }

  // ENHANCEMENT: Implement AI mockup generation with Replicate or Stability AI
  // When enabled, this will visualize roofs with selected materials/colors
  //
  // Example integration with Replicate:
  // const Replicate = require("replicate");
  // const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  // const output = await replicate.run("stability-ai/sdxl:...", {
  //   input: {
  //     image: imageUrl,
  //     prompt: `Professional ${material || 'asphalt'} roof in ${color || 'weathered wood'} color`,
  //     negative_prompt: "blurry, low quality, distorted",
  //     num_outputs: 1,
  //   }
  // });
  // const mockupUrl = output[0];

  // For now, return graceful disable response
  return ok({
    mockupUrl: imageUrl,
    original: imageUrl,
    address,
    isConfigured: true,
    isPending: true,
    message:
      "AI mockup generation is in development. This will generate photorealistic roof mockups once integration is complete.",
    requestedOptions: {
      material,
      color,
      prompt,
    },
  });
}

export const POST = withErrorHandler(handlePOST, "POST /api/ai/mockup");
