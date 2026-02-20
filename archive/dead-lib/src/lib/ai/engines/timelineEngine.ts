/**
 * ============================================================================
 * PHASE 13.2: AI PHOTO TIMELINE ENGINE
 * The Industry's First Photo-Driven Build Timeline & Supplement Detector
 * ============================================================================
 *
 * This engine performs 6 critical functions:
 *
 * A) Sort all photos by timestamp/EXIF/AI-guess
 * B) Classify build stage (tearoff → completion)
 * C) Detect supplement opportunities from photos
 * D) Generate build narrative (per phase)
 * E) Create official AI timeline JSON
 * F) Save everything to database
 *
 * This is the backbone of the Depreciation Builder.
 */

import { getOpenAI } from "@/lib/ai/client";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

import { extractEXIF } from "../../utils/exifExtractor";

const openai = getOpenAI();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BuildStage =
  | "tearoff"
  | "deck_inspection"
  | "midbuild"
  | "underlayment"
  | "flashings"
  | "shingle_install"
  | "completion"
  | "cleanup"
  | "unknown";

export type SupplementSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface PhotoAnalysis {
  photoId: string;
  url: string;
  fileName?: string;

  // Timing
  timestampGuess: Date | null;
  timelineOrder: number;

  // Classification
  buildStage: BuildStage;
  buildStageConfidence: number;

  // AI Analysis
  aiDescription: string;
  detectedMaterials: string[];
  detectedIssues: string[];
  keyframe: boolean; // Important milestone photo

  // Supplement Detection
  supplementFlags: SupplementFlag[];
}

export interface SupplementFlag {
  item: string;
  severity: SupplementSeverity;
  reason: string;
  photoId: string;
  recommendedLineItem: string;
  estimatedCost?: number;
  codeCitation?: string;
}

export interface TimelineStage {
  stage: BuildStage;
  order: number;
  description: string;
  photoIds: string[];
  aiNarrative: string;
  detectedMaterials: string[];
  detectedIssues: string[];
  supplementOpportunities: SupplementFlag[];
}

export interface BuildTimeline {
  claimId: string;
  timeline: TimelineStage[];
  supplements: SupplementFlag[];
  narrativeText: string;
  totalPhotosAnalyzed: number;
  aiConfidenceScore: number;
}

// ============================================================================
// A) PHOTO SORTING & TIMESTAMP EXTRACTION
// ============================================================================

/**
 * Sort photos by timestamp (EXIF → cloud metadata → AI guess → fallback)
 */
export async function sortPhotosByTime(photos: any[]): Promise<PhotoAnalysis[]> {
  const analyzed: PhotoAnalysis[] = [];

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];

    // Try to extract EXIF timestamp
    let timestamp: Date | null = null;
    try {
      const exif = await extractEXIF(photo.url);
      timestamp = exif.dateTime || exif.dateTimeOriginal || null;
    } catch (err) {
      logger.warn(`EXIF extraction failed for photo ${photo.id}:`, err);
    }

    // Fallback to createdAt or uploadedAt
    if (!timestamp) {
      timestamp = photo.createdAt || new Date();
    }

    analyzed.push({
      photoId: photo.id,
      url: photo.url,
      fileName: photo.fileName,
      timestampGuess: timestamp,
      timelineOrder: i, // Will be re-ordered after AI classification
      buildStage: "unknown",
      buildStageConfidence: 0,
      aiDescription: "",
      detectedMaterials: [],
      detectedIssues: [],
      keyframe: false,
      supplementFlags: [],
    });
  }

  // Sort by timestamp
  analyzed.sort((a, b) => {
    if (!a.timestampGuess) return 1;
    if (!b.timestampGuess) return -1;
    return a.timestampGuess.getTime() - b.timestampGuess.getTime();
  });

  // Update timeline order
  analyzed.forEach((photo, idx) => {
    photo.timelineOrder = idx + 1;
  });

  return analyzed;
}

// ============================================================================
// B) BUILD STAGE CLASSIFICATION (AI Vision)
// ============================================================================

const BUILD_STAGE_PROMPTS: Record<BuildStage, string> = {
  tearoff: "Removal of old roofing materials, exposed decking, debris visible",
  deck_inspection: "Exposed roof deck, checking for rot or damage, no materials yet",
  midbuild: "Partial installation, work in progress",
  underlayment: "Installation of synthetic or felt underlayment, ice & water shield",
  flashings: "Installation of drip edge, valley metal, pipe jacks, step flashing",
  shingle_install: "Shingle installation in progress, partial coverage",
  completion: "Finished roof, clean jobsite, final walkthrough",
  cleanup: "Debris removal, dumpster, final site cleanup",
  unknown: "Unable to determine build stage",
};

/**
 * Classify photo build stage using GPT-4 Vision
 */
export async function classifyBuildStage(
  photoUrl: string
): Promise<{ stage: BuildStage; confidence: number; description: string }> {
  const prompt = `You are a roofing inspector AI analyzing jobsite photos.

Classify this photo into ONE of these build stages:
${Object.entries(BUILD_STAGE_PROMPTS)
  .map(([stage, desc]) => `- ${stage}: ${desc}`)
  .join("\n")}

Respond in JSON format:
{
  "stage": "tearoff" | "deck_inspection" | "midbuild" | "underlayment" | "flashings" | "shingle_install" | "completion" | "cleanup" | "unknown",
  "confidence": 0.85,
  "description": "Brief description of what's visible in the photo"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: photoUrl } },
          ],
        },
      ],
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      stage: result.stage || "unknown",
      confidence: result.confidence || 0.5,
      description: result.description || "",
    };
  } catch (error) {
    logger.error("Build stage classification error:", error);
    return {
      stage: "unknown",
      confidence: 0,
      description: "Classification failed",
    };
  }
}

// ============================================================================
// C) SUPPLEMENT DETECTION FROM PHOTOS
// ============================================================================

/**
 * Detect supplement opportunities from photo using AI Vision
 */
export async function detectSupplementsFromPhoto(
  photoUrl: string,
  buildStage: BuildStage
): Promise<SupplementFlag[]> {
  const prompt = `You are a roofing supplement detection AI.

Analyze this ${buildStage} photo and identify ANY materials or work visible that might NOT have been paid by the insurance carrier.

Common unpaid items:
- Ice & Water Shield in valleys/eaves
- Double or triple layer tear-off
- Rotted decking replacement
- Valley metal installation
- Drip edge (full perimeter)
- Starter strips (eaves and rakes)
- Synthetic underlayment upgrades
- Pipe jack replacements
- Attic venting additions
- Hidden damage revealed during tear-off
- Flashing replacements
- Ridge venting

For EACH detected supplement opportunity, respond with:
{
  "supplements": [
    {
      "item": "Ice & Water Shield",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "reason": "Visible application of ice & water barrier in valleys, likely unpaid by carrier",
      "recommendedLineItem": "RFG Ice & Water Shield installation per LF",
      "estimatedCost": 450,
      "codeCitation": "IRC R905.2.7.1 - Required for code compliance"
    }
  ]
}

If no supplements detected, return: { "supplements": [] }`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: photoUrl } },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"supplements": []}');
    return result.supplements || [];
  } catch (error) {
    logger.error("Supplement detection error:", error);
    return [];
  }
}

// ============================================================================
// D) BUILD NARRATIVE GENERATOR
// ============================================================================

/**
 * Generate AI narrative for a build stage
 */
export async function generateStageNarrative(
  stage: BuildStage,
  photos: PhotoAnalysis[]
): Promise<string> {
  const descriptions = photos.map((p) => p.aiDescription).filter(Boolean);
  const materials = [...new Set(photos.flatMap((p) => p.detectedMaterials))];
  const issues = [...new Set(photos.flatMap((p) => p.detectedIssues))];

  const prompt = `You are a professional roofing contractor writing a completion narrative for a carrier.

Build Stage: ${stage}
Number of Photos: ${photos.length}
Photo Descriptions: ${descriptions.join("; ")}
Detected Materials: ${materials.join(", ")}
Detected Issues: ${issues.join(", ")}

Write a 2-3 sentence professional narrative describing what work was performed during this stage.
Use carrier-friendly language. Be specific and factual.
Focus on materials installed, issues discovered, and code compliance.

Example formats:
- Tear-off: "Photos 1-4 show complete removal of two existing layers of shingles. Decking is visible with exposed sheathing. Notable rot present on the southwest elevation, indicating code-required deck replacement."
- Completion: "Photos 12-20 show final installed GAF Timberline HDZ system, ridge caps installed, flashings painted, jobsite cleaned."`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    logger.error("Narrative generation error:", error);
    return `${stage} phase completed with ${photos.length} photos documented.`;
  }
}

// ============================================================================
// E) MAIN TIMELINE ENGINE
// ============================================================================

/**
 * MAIN FUNCTION: Build complete AI timeline from photos
 */
export async function buildPhotoTimeline(claim_id: string): Promise<BuildTimeline> {
  logger.debug(`[TimelineEngine] Building timeline for claim ${claim_id}`);

  // 1. Fetch all photos for this claim
  const PhotoMeta = prismaModel<any>(
    "claimPhotoMeta",
    "claim_photo_meta",
    "claimPhotoMetas",
    "ClaimPhotoMeta",
    "photoMeta",
    "claim_photo_metadata"
  );

  const photos = PhotoMeta
    ? await PhotoMeta.findMany({
        where: { claimId: claim_id },
        orderBy: { createdAt: "asc" },
      })
    : [];

  if (photos.length === 0) {
    throw new Error("No photos found for timeline generation");
  }

  logger.debug(`[TimelineEngine] Found ${photos.length} photos`);

  // 2. Sort photos by timestamp
  let analyzed = await sortPhotosByTime(photos);
  logger.debug(`[TimelineEngine] Photos sorted by timestamp`);

  // 3. Classify each photo's build stage using AI Vision
  for (let i = 0; i < analyzed.length; i++) {
    const photo = analyzed[i];
    logger.debug(`[TimelineEngine] Analyzing photo ${i + 1}/${analyzed.length}: ${photo.fileName}`);

    const classification = await classifyBuildStage(photo.url);
    photo.buildStage = classification.stage;
    photo.buildStageConfidence = classification.confidence;
    photo.aiDescription = classification.description;

    // Mark as keyframe if high confidence and important stage
    photo.keyframe =
      classification.confidence > 0.8 &&
      ["tearoff", "underlayment", "completion"].includes(classification.stage);
  }

  // 4. Detect supplements from each photo
  for (const photo of analyzed) {
    logger.debug(`[TimelineEngine] Detecting supplements in ${photo.fileName}`);

    const supplements = await detectSupplementsFromPhoto(photo.url, photo.buildStage);
    photo.supplementFlags = supplements.map((s) => ({
      ...s,
      photoId: photo.photoId,
    }));
  }

  // 5. Group photos by build stage
  const stageGroups: Record<BuildStage, PhotoAnalysis[]> = {
    tearoff: [],
    deck_inspection: [],
    midbuild: [],
    underlayment: [],
    flashings: [],
    shingle_install: [],
    completion: [],
    cleanup: [],
    unknown: [],
  };

  for (const photo of analyzed) {
    stageGroups[photo.buildStage].push(photo);
  }

  // 6. Build timeline stages
  const timeline: TimelineStage[] = [];
  let order = 1;

  const stageOrder: BuildStage[] = [
    "tearoff",
    "deck_inspection",
    "underlayment",
    "flashings",
    "midbuild",
    "shingle_install",
    "completion",
    "cleanup",
  ];

  for (const stage of stageOrder) {
    const stagePhotos = stageGroups[stage];
    if (stagePhotos.length === 0) continue;

    console.log(
      `[TimelineEngine] Generating narrative for ${stage} (${stagePhotos.length} photos)`
    );
    const narrative = await generateStageNarrative(stage, stagePhotos);

    const allMaterials = [...new Set(stagePhotos.flatMap((p) => p.detectedMaterials))];
    const allIssues = [...new Set(stagePhotos.flatMap((p) => p.detectedIssues))];
    const allSupplements = stagePhotos.flatMap((p) => p.supplementFlags);

    timeline.push({
      stage,
      order: order++,
      description: `${stagePhotos.length} photos - ${stage.replace("_", " ")}`,
      photoIds: stagePhotos.map((p) => p.photoId),
      aiNarrative: narrative,
      detectedMaterials: allMaterials,
      detectedIssues: allIssues,
      supplementOpportunities: allSupplements,
    });
  }

  // 7. Collect all supplements across all stages
  const allSupplements = analyzed.flatMap((p) => p.supplementFlags);

  // 8. Generate full narrative text
  const narrativeText = timeline
    .map((stage) => `${stage.stage.toUpperCase()} PHASE\n${stage.aiNarrative}`)
    .join("\n\n");

  // 9. Calculate confidence score (average of all photo confidences)
  const avgConfidence =
    analyzed.reduce((sum, p) => sum + p.buildStageConfidence, 0) / analyzed.length;

  // 10. Save analyzed photos to database
  if (PhotoMeta) {
    for (const photo of analyzed) {
      await PhotoMeta.update({
        where: { id: photo.photoId },
        data: {
          timestampGuess: photo.timestampGuess,
          buildStage: photo.buildStage,
          timelineOrder: photo.timelineOrder,
          aiMetadata: {
            confidence: photo.buildStageConfidence,
            description: photo.aiDescription,
            detectedMaterials: photo.detectedMaterials,
            detectedIssues: photo.detectedIssues,
            keyframe: photo.keyframe,
            supplementFlags: JSON.parse(JSON.stringify(photo.supplementFlags)),
          } as any,
          analyzed: true,
        },
      });
    }
  }

  logger.debug(`[TimelineEngine] Timeline generation complete!`);
  return {
    claimId,
    timeline,
    supplements: allSupplements,
    narrativeText,
    totalPhotosAnalyzed: analyzed.length,
    aiConfidenceScore: avgConfidence,
  };
}

// ============================================================================
// F) SAVE TIMELINE TO DATABASE
// ============================================================================

/**
 * Save generated timeline to completion_timeline table
 */
export async function saveTimelineToDatabase(
  buildTimeline: BuildTimeline,
  orgId: string
): Promise<string> {
  const timelineRecord = await prisma.completion_timeline.create({
    data: {
      claim_id: buildTimeline.claim_id,
      orgId,
      timeline: buildTimeline.timeline as any,
      supplements: buildTimeline.supplements as any,
      narrativeText: buildTimeline.narrativeText,
      narrativeVersion: "carrier",
      aiModelVersion: "gpt-4o",
      aiConfidenceScore: buildTimeline.aiConfidenceScore,
      totalPhotosAnalyzed: buildTimeline.totalPhotosAnalyzed,
      totalSupplementsDetected: buildTimeline.supplements.length,
      highSeverityCount: buildTimeline.supplements.filter((s) => s.severity === "HIGH").length,
      mediumSeverityCount: buildTimeline.supplements.filter((s) => s.severity === "MEDIUM").length,
      lowSeverityCount: buildTimeline.supplements.filter((s) => s.severity === "LOW").length,
      status: "draft",
    },
  });
  logger.debug(`[TimelineEngine] Timeline saved to database: ${timelineRecord.id}`);
  return timelineRecord.id;
}

// ============================================================================
// EXPORT MAIN API
// ============================================================================

/**
 * PUBLIC API: Generate and save timeline for a claim
 */
export async function generateClaimTimeline(
  claim_id: string,
  orgId: string
): Promise<{ timelineId: string; timeline: BuildTimeline }> {
  const buildTimeline = await buildPhotoTimeline(claim_id);
  const timelineId = await saveTimelineToDatabase(buildTimeline, orgId);

  return {
    timelineId,
    timeline: buildTimeline,
  };
}
