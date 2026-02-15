// ============================================================================
// GET /api/search - Find pros by location and filters
// ============================================================================

import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse,successResponse, validationError } from "@/lib/responses";
import { calculateZipDistance } from "@/lib/zipDistance";
import { TRADE_TYPES } from "@/types";

const searchSchema = z.object({
  zip: z.string().regex(/^\d{5}$/),
  radiusMiles: z.number().int().min(5).max(200).optional().default(25),
  tradeType: z.enum(TRADE_TYPES).optional(),
  minRating: z.number().min(0).max(5).optional(),
  emergencyOnly: z.boolean().optional().default(false),
  insuredOnly: z.boolean().optional().default(false),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export async function GET(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);

  try {
    // Parse query parameters
    const filters = searchSchema.parse({
      zip: searchParams.get("zip"),
      radiusMiles: searchParams.get("radiusMiles")
        ? parseInt(searchParams.get("radiusMiles")!)
        : 25,
      tradeType: searchParams.get("tradeType"),
      minRating: searchParams.get("minRating")
        ? parseFloat(searchParams.get("minRating")!)
        : undefined,
      emergencyOnly: searchParams.get("emergencyOnly") === "true",
      insuredOnly: searchParams.get("insuredOnly") === "true",
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    });

    // Build Prisma where clause
    const where: any = {
      acceptingClients: true,
    };

    if (filters.tradeType) {
      where.tradeType = filters.tradeType;
    }

    if (filters.minRating) {
      where.avgRating = { gte: filters.minRating };
    }

    if (filters.emergencyOnly) {
      where.emergencyService = true;
    }

    if (filters.insuredOnly) {
      where.insured = true;
    }

    // Fetch all matching pros (we'll filter by distance in memory)
    const allPros = await prisma.tradeProfile.findMany({
      where,
      select: {
        id: true,
        clerkUserId: true,
        companyName: true,
        tradeType: true,
        specialties: true,
        bio: true,
        portfolio: true,
        licenseNumber: true,
        insured: true,
        yearsExperience: true,
        baseZip: true,
        radiusMiles: true,
        avgRating: true,
        reviewCount: true,
        completedJobs: true,
        responseRate: true,
        acceptingClients: true,
        emergencyService: true,
        createdAt: true,
      },
    });

    // Filter by distance and calculate scores
    const results = allPros
      .map((pro) => {
        if (!pro.baseZip) return null;

        const distance = calculateZipDistance(filters.zip, pro.baseZip);
        if (distance === null || distance > Math.max(filters.radiusMiles, pro.radiusMiles)) {
          return null;
        }

        // Calculate weighted score
        const distanceScore = Math.max(0, 100 - (distance / filters.radiusMiles) * 100); // 0-100
        const ratingScore = (pro.avgRating / 5) * 100; // 0-100
        const experienceScore = Math.min((pro.completedJobs / 50) * 100, 100); // 0-100
        const responseScore = pro.responseRate; // 0-100

        const score =
          distanceScore * 0.3 + ratingScore * 0.3 + experienceScore * 0.2 + responseScore * 0.2;

        return {
          profile: pro,
          distance: Math.round(distance * 10) / 10,
          score: Math.round(score * 10) / 10,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, filters.limit);

    return successResponse(
      {
        results,
        count: results.length,
        filters,
      },
      200
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationError(error.errors.map((e) => e.message).join(", "));
    }
    console.error("[Search] Error:", error);
    return errorResponse("Search failed", 500);
  }
}
