// ORG-SCOPE: Public marketplace data — cross-org by design
// No auth required. Searches all active tradesCompany, tradesCompanyMember,
// and tradesProfile records for client-facing contractor matching.
// None of these tables use orgId; the marketplace is intentionally cross-org.

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Trades Network Search & Matching API
 * GET /api/trades/match
 *
 * Searches tradesCompany (companies) and tradesCompanyMember (individuals)
 * to find matching professionals for clients.
 */

interface MatchFilters {
  zip?: string;
  tradeType?: string;
  maxDistance?: number;
  verifiedOnly?: boolean;
  minRating?: number;
  sortBy?: "engagement" | "rating" | "distance" | "newest";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: MatchFilters = {
      zip: searchParams.get("zip") || undefined,
      tradeType: searchParams.get("tradeType") || searchParams.get("trade") || undefined,
      maxDistance: searchParams.get("maxDistance")
        ? parseInt(searchParams.get("maxDistance")!)
        : searchParams.get("radius")
          ? parseInt(searchParams.get("radius")!)
          : 50,
      verifiedOnly: searchParams.get("verifiedOnly") === "true",
      minRating: searchParams.get("minRating")
        ? parseFloat(searchParams.get("minRating")!)
        : undefined,
      sortBy: (searchParams.get("sortBy") as MatchFilters["sortBy"]) || "engagement",
    };

    // Query tradesCompany - companies in the trades network
    // Note: Column names are isActive and isVerified (not isPublic, status, verified)
    const companyWhere: any = {
      isActive: true,
    };

    // Apply trade type filter if provided
    if (filters.tradeType) {
      companyWhere.OR = [
        { specialties: { has: filters.tradeType } },
        { name: { contains: filters.tradeType, mode: "insensitive" } },
      ];
    }

    // Apply verified filter
    if (filters.verifiedOnly) {
      companyWhere.isVerified = true;
    }

    // Fetch companies
    const companies = await prisma.tradesCompany.findMany({
      where: companyWhere,
      include: {
        members: {
          where: { status: "active" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            tradeType: true,
            jobTitle: true,
          },
          take: 3,
        },
      },
      orderBy: [{ isVerified: "desc" }, { rating: "desc" }, { reviewCount: "desc" }],
      take: 50,
    });

    // Also query individual members (solo operators or those with companyName but no formal company)
    const memberWhere: any = {
      status: "active",
    };

    // Include members without a company OR with a company name but null companyId
    // This captures solo operators who filled in their company name manually
    if (filters.tradeType) {
      memberWhere.OR = [
        { tradeType: { equals: filters.tradeType, mode: "insensitive" } },
        { specialties: { has: filters.tradeType } },
      ];
    }

    const soloMembers = await prisma.tradesCompanyMember.findMany({
      where: memberWhere,
      select: {
        id: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        profilePhoto: true,
        tradeType: true,
        jobTitle: true,
        bio: true,
        yearsExperience: true,
        specialties: true,
        companyName: true,
        city: true,
        state: true,
        coverPhoto: true,
        // Enhanced fields for rich cards
        tagline: true,
        rocNumber: true,
        insuranceProvider: true,
        bondAmount: true,
        emergencyAvailable: true,
        freeEstimates: true,
        portfolioImages: true,
        companyWebsite: true,
        // Engagement & reviews
        pro_engagement: {
          select: {
            engagementScore: true,
            profileViews: true,
          },
        },
        reviews: {
          where: { status: "published" },
          select: {
            rating: true,
            comment: true,
            Client: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ pro_engagement: { engagementScore: "desc" } }],
      take: 30,
    });

    // Also query TradesProfile - for pros who signed up through the trades profile flow
    // Note: model is TradesProfile (with s), fields: companyName (not businessName),
    // verified (not isVerified), active (not isPublic), specialties is String[]
    const tradesProfileWhere: any = {
      active: true,
    };

    if (filters.tradeType) {
      tradesProfileWhere.OR = [
        { specialties: { has: filters.tradeType } },
        { companyName: { contains: filters.tradeType, mode: "insensitive" } },
      ];
    }

    if (filters.verifiedOnly) {
      tradesProfileWhere.verified = true;
    }

    const tradesProfiles = await prisma.tradesProfile.findMany({
      where: tradesProfileWhere,
      select: {
        id: true,
        userId: true,
        companyName: true,
        contactName: true,
        specialties: true,
        bio: true,
        yearsInBusiness: true,
        city: true,
        state: true,
        phone: true,
        email: true,
        website: true,
        avatarUrl: true,
        logoUrl: true,
        rating: true,
        reviewCount: true,
        verified: true,
      },
      orderBy: [{ verified: "desc" }, { rating: "desc" }],
      take: 30,
    });

    // Format results for the frontend
    const matches = [
      // Companies first
      ...companies.map((company) => ({
        id: company.id,
        type: "company" as const,
        name: company.name,
        companyName: company.name,
        tradeType: company.specialties?.[0] || "General Contractor",
        specialties: company.specialties,
        logo: company.logo,
        coverPhoto: company.coverimage,
        verified: company.isVerified,
        rating: company.rating ? parseFloat(company.rating.toString()) : null,
        reviewCount: company.reviewCount,
        city: company.city,
        state: company.state,
        phone: company.phone,
        email: company.email,
        website: company.website,
        description: company.description,
        members: company.members,
      })),
      // Trades Profiles (pros who signed up through profile flow)
      ...tradesProfiles.map((profile) => ({
        id: profile.id,
        type: "individual" as const,
        name: profile.companyName || profile.contactName || "Professional",
        companyName: profile.companyName,
        tradeType: profile.specialties?.[0] || "Professional",
        specialties: profile.specialties,
        avatar: profile.avatarUrl || profile.logoUrl,
        coverPhoto: null,
        verified: profile.verified,
        rating: profile.rating ? parseFloat(profile.rating.toString()) : null,
        reviewCount: profile.reviewCount || 0,
        phone: profile.phone,
        email: profile.email,
        website: profile.website,
        bio: profile.bio,
        yearsExperience: profile.yearsInBusiness,
        city: profile.city,
        state: profile.state,
      })),
      // Solo members / independent professionals
      ...soloMembers.map((member) => {
        const recentReview = member.reviews?.[0];
        return {
          id: member.id,
          type: "individual" as const,
          name: `${member.firstName || ""} ${member.lastName || ""}`.trim() || "Professional",
          companyName: member.companyName || null,
          tradeType: member.tradeType || "Professional",
          specialties: member.specialties,
          avatar: member.avatar || member.profilePhoto,
          coverPhoto: member.coverPhoto,
          verified: false,
          // Enhanced fields
          tagline: member.tagline,
          bio: member.bio,
          yearsExperience: member.yearsExperience,
          city: member.city,
          state: member.state,
          phone: member.phone,
          email: member.email,
          website: member.companyWebsite,
          // Trust badges
          isLicensed: !!member.rocNumber,
          rocNumber: member.rocNumber,
          isBonded: !!member.bondAmount,
          isInsured: !!member.insuranceProvider,
          // Availability
          emergencyAvailable: member.emergencyAvailable || false,
          freeEstimates: member.freeEstimates ?? true,
          // Portfolio
          portfolioImages: member.portfolioImages || [],
          // Reviews (calculated from reviews relation)
          rating: member.reviews?.length
            ? member.reviews.reduce((sum, r) => sum + r.rating, 0) / member.reviews.length
            : null,
          reviewCount: member.reviews?.length || 0,
          recentReview: recentReview
            ? {
                text:
                  recentReview.comment?.slice(0, 100) +
                  (recentReview.comment?.length > 100 ? "..." : ""),
                rating: recentReview.rating,
                author:
                  `${recentReview.Client?.firstName || ""} ${recentReview.Client?.lastName?.charAt(0) || ""}`.trim() ||
                  "Client",
              }
            : null,
          // Engagement score for sorting
          engagementScore: member.pro_engagement?.engagementScore || 0,
        };
      }),
    ];

    // Apply minRating filter
    let filteredMatches = matches;
    if (filters.minRating) {
      filteredMatches = matches.filter((m) => m.rating && m.rating >= filters.minRating!);
    }

    // Sort based on sortBy parameter
    const sortedMatches = filteredMatches.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "distance":
          // For now, keep original order (distance not yet calculated)
          return 0;
        case "newest":
          // For now, companies first, then individuals
          return a.type === "company" ? -1 : 1;
        case "engagement":
        default:
          // Sort by engagement score, fall back to rating
          const aScore = (a as any).engagementScore || 0;
          const bScore = (b as any).engagementScore || 0;
          if (bScore !== aScore) return bScore - aScore;
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    return NextResponse.json({
      success: true,
      matches: sortedMatches,
      metadata: {
        totalMatches: sortedMatches.length,
        companiesFound: companies.length,
        tradesProfilesFound: tradesProfiles.length,
        individualsFound: soloMembers.length,
        filters,
      },
    });
  } catch (error) {
    console.error("[GET /api/trades/match] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
