// ============================================================================
// POST /api/reviews - Submit review for pro
// GET /api/reviews - Get reviews for pro
// ============================================================================

import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, validationError } from "@/lib/responses";

const reviewSchema = z.object({
  proClerkId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  jobType: z.string().optional(),
  jobCompleted: z.boolean(),
});

// ============================================================================
// POST /api/reviews - Create review
// ============================================================================

export async function POST(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const clientClerkId = auth.clerkUserId;
  if (!clientClerkId) {
    return errorResponse("Missing clerkUserId in token", 400);
  }

  try {
    const body = await req.json();
    const validated = reviewSchema.parse(body);

    // Check if pro exists
    const proProfile = await prisma.tradeProfile.findUnique({
      where: { clerkUserId: validated.proClerkId },
    });

    if (!proProfile) {
      return errorResponse("Pro profile not found", 404);
    }

    // Check if connection exists and was accepted
    const connection = await prisma.clientProConnection.findUnique({
      where: {
        clientClerkId_proClerkId: {
          clientClerkId,
          proClerkId: validated.proClerkId,
        },
      },
    });

    if (!connection || connection.status !== "accepted") {
      return errorResponse("Can only review pros you have worked with", 400);
    }

    // Check if already reviewed
    const existingReview = await prisma.tradeReview.findFirst({
      where: {
        clientClerkId,
        proClerkId: validated.proClerkId,
      },
    });

    if (existingReview) {
      return errorResponse("You have already reviewed this pro", 400);
    }

    // Create review
    const review = await prisma.tradeReview.create({
      data: {
        proClerkId: validated.proClerkId,
        clientClerkId,
        rating: validated.rating,
        comment: validated.comment,
        jobType: validated.jobType,
        jobCompleted: validated.jobCompleted,
        verified: true, // Verified because we checked connection
      },
    });

    // Update pro's avg rating and review count
    const allReviews = await prisma.tradeReview.findMany({
      where: { proClerkId: validated.proClerkId },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.tradeProfile.update({
      where: { clerkUserId: validated.proClerkId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return successResponse({ review }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationError(error.errors.map((e) => e.message).join(", "));
    }
    console.error("[Reviews POST] Error:", error);
    return errorResponse("Failed to create review", 500);
  }
}

// ============================================================================
// GET /api/reviews?proClerkId=xxx - Get reviews for pro
// ============================================================================

export async function GET(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const proClerkId = searchParams.get("proClerkId");

  if (!proClerkId) {
    return validationError("Missing proClerkId parameter");
  }

  try {
    const reviews = await prisma.tradeReview.findMany({
      where: { proClerkId },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ reviews, count: reviews.length }, 200);
  } catch (error) {
    console.error("[Reviews GET] Error:", error);
    return errorResponse("Failed to fetch reviews", 500);
  }
}
