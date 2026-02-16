import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/network/trending-pros
 *
 * Fetches trending/featured contractors for the network
 * Based on recent reviews, ratings, and activity
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const trade = searchParams.get("trade") || "";

    // Fetch top-rated active companies
    // NOTE: Intentionally cross-org — public marketplace/directory listing
    const companies = await prisma.tradesCompany
      .findMany({
        where: {
          isActive: true,
          ...(trade && trade !== "All Trades"
            ? {
                specialties: { has: trade },
              }
            : {}),
        },
        orderBy: [{ isVerified: "desc" }, { rating: "desc" }, { reviewCount: "desc" }],
        take: limit,
        select: {
          id: true,
          name: true,
          logo: true,
          coverimage: true,
          rating: true,
          reviewCount: true,
          isVerified: true,
          city: true,
          state: true,
          specialties: true,
          description: true,
          yearsInBusiness: true,
        },
      })
      .catch(() => []);

    // Get recent review counts for each company (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const companyIds = companies.map((c: any) => c.id);
    // Note: TradeReview uses contractorId (member ID), not companyId
    // Using stored reviewCount from tradesCompany instead
    const reviewCountMap = new Map<string, number>();

    // Transform to trending pros format
    const trendingPros = companies.map((company: any) => ({
      id: company.id,
      name: company.name,
      trade: company.specialties?.[0] || "General Contractor",
      rating: company.rating || 0,
      reviewCount: company.reviewCount || 0,
      recentReviews: reviewCountMap.get(company.id) || 0,
      isVerified: company.isVerified || false,
      logo: company.logo,
      coverimage: company.coverimage,
      location:
        company.city && company.state
          ? `${company.city}, ${company.state}`
          : company.city || company.state || null,
      description: company.description,
      yearsInBusiness: company.yearsInBusiness,
    }));

    return NextResponse.json({
      pros: trendingPros,
      total: trendingPros.length,
    });
  } catch (error: any) {
    logger.error("[Trending Pros] Error:", error);
    return NextResponse.json({ error: "Failed to fetch trending pros" }, { status: 500 });
  }
}
