import { currentUser } from "@clerk/nextjs/server";
import { NextRequest,NextResponse } from "next/server";

import { getTenant } from "@/lib/auth/tenant";
import { getRateLimitIdentifier,rateLimiters } from "@/lib/rate-limit";

// Retry configuration for AI service calls
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("[AI_VISION] 🔍 Starting damage analysis request");

  try {
    const orgId = await getTenant();
    if (!orgId) {
      console.error("[AI_VISION] ❌ Unauthorized - no orgId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting check (10 requests per minute for AI endpoints)
    const clerkUser = await currentUser();
    const identifier = getRateLimitIdentifier(clerkUser?.id || null, request);
    const allowed = await rateLimiters.ai.check(10, identifier);

    if (!allowed) {
      console.log("[AI_VISION] ⚠️  Rate limit exceeded for:", identifier);
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    console.log(`[AI_VISION] ✅ Authorized orgId: ${orgId}`);

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const claimId = formData.get("claimId") as string;

    if (!image) {
      console.error("[AI_VISION] ❌ No image provided");
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    console.log(
      `[AI_VISION] 📸 Processing image: ${image.name} (${image.size} bytes, ${image.type})`
    );

    // Convert image to base64 for AI service
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    console.log(`[AI_VISION] 🔄 Converted to base64: ${base64Image.length} chars`);

    // Verify API configuration
    const endpoint =
      process.env.DOMINUS_AI_VISION_ENDPOINT || "https://api.dominusai.com/v1/vision/analyze";
    const apiKey = process.env.DOMINUS_AI_API_KEY;

    if (!apiKey) {
      console.error("[AI_VISION] ❌ CRITICAL: DOMINUS_AI_API_KEY not configured!");
      return NextResponse.json(
        { error: "AI service configuration error. Please contact support." },
        { status: 503 }
      );
    }

    console.log(`[AI_VISION] 🌐 Using endpoint: ${endpoint}`);
    console.log(`[AI_VISION] 🔑 API key configured: ${apiKey.substring(0, 10)}...`);

    let lastError: Error | null = null;
    let aiResponse: Response | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[AI_VISION] 🚀 Attempt ${attempt}/${MAX_RETRIES} - Calling Dominus AI Vision Service...`
        );

        // Call Dominus AI Vision Service
        aiResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            image: base64Image,
            imageType: image.type,
            analysisType: "damage_detection",
            features: ["damage_type", "severity", "confidence", "recommendations"],
            metadata: {
              orgId,
              claimId,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        console.log(
          `[AI_VISION] 📡 Response status: ${aiResponse.status} ${aiResponse.statusText}`
        );

        if (aiResponse.ok) {
          console.log(`[AI_VISION] ✅ Success on attempt ${attempt}`);
          break; // Success!
        }

        // Log error response
        const errorText = await aiResponse.text();
        console.error(
          `[AI_VISION] ⚠️ Attempt ${attempt} failed: ${aiResponse.status} - ${errorText}`
        );
        lastError = new Error(`HTTP ${aiResponse.status}: ${errorText}`);

        // Retry on 5xx errors or network issues
        if (attempt < MAX_RETRIES && aiResponse.status >= 500) {
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`[AI_VISION] ⏳ Retrying in ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        break; // Don't retry on 4xx errors
      } catch (fetchError) {
        console.error(`[AI_VISION] ❌ Attempt ${attempt} threw error:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
          console.log(`[AI_VISION] ⏳ Retrying after network error in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    if (!aiResponse || !aiResponse.ok) {
      console.error(`[AI_VISION] ❌ All retry attempts exhausted. Last error:`, lastError);
      return NextResponse.json(
        {
          error: "AI Vision service unavailable. Please try again later.",
          details: lastError?.message,
        },
        { status: 503 }
      );
    }

    const aiData = await aiResponse.json();
    console.log(
      `[AI_VISION] 📊 Received AI analysis data:`,
      JSON.stringify(aiData).substring(0, 200)
    );

    // Parse and format AI response
    const processingTime = Date.now() - startTime;
    console.log(`[AI_VISION] ⏱️ Total processing time: ${processingTime}ms`);

    const response = {
      success: true,
      analysis: {
        damageType: aiData.damage_type || "Unknown",
        confidence: aiData.confidence || 0,
        severity: aiData.severity || "Unknown",
        affectedArea: aiData.affected_area || "Not specified",
        recommendations: aiData.recommendations || [],
        detectedFeatures: aiData.features || [],
      },
      metadata: {
        imageSize: image.size,
        imageType: image.type,
        processedAt: new Date().toISOString(),
        processingTimeMs: processingTime,
        claimId,
        orgId,
      },
    };

    console.log(
      `[AI_VISION] ✨ Success! Damage type: ${response.analysis.damageType}, Confidence: ${response.analysis.confidence}`
    );
    return NextResponse.json(response);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[AI_VISION] 💥 CRITICAL ERROR after ${processingTime}ms:`, error);
    console.error(
      `[AI_VISION] Error stack:`,
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : "Unknown error",
        processingTimeMs: processingTime,
      },
      { status: 500 }
    );
  }
}
