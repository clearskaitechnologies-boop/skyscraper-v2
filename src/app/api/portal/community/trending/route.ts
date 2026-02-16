// ORG-SCOPE: Public marketplace — queries active tradesCompanyMember/tradesProfile. Cross-org by design (pro discovery).
/**
 * Trending Pros API
 * Returns contractors with most recent reviews/activity
 */

import { NextRequest, NextResponse } from "next/server";

import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const trade = searchParams.get("trade");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const whereClause: any = {
      status: "active",
    };

    if (trade && trade !== "All Trades") {
      whereClause.tradeType = trade;
    }

    // Get contractors with recent activity (reviews in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch members with engagement data
    const members = await prisma.tradesCompanyMember.findMany({
      where: whereClause,
      orderBy: [{ pro_engagement: { engagementScore: "desc" } }],
      take: limit,
      include: {
        pro_engagement: {
          select: {
            engagementScore: true,
            profileViews: true,
          },
        },
        reviews: {
          where: {
            status: "published",
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            id: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { status: "published" },
            },
          },
        },
      },
    });

    // Also get TradesProfiles
    const profiles = await prisma.tradesProfile.findMany({
      where: {
        active: true,
        ...(trade && trade !== "All Trades" ? { specialties: { has: trade } } : {}),
      },
      orderBy: [{ rating: "desc" }],
      take: limit,
    });

    // Combine and transform
    const memberPros = members.map((m) => {
      const allReviews = m.reviews || [];
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      return {
        id: m.id,
        name: m.companyName || `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Professional",
        trade: m.tradeType || "Professional",
        rating: Math.round(avgRating * 10) / 10 || 0,
        reviewCount: m._count?.reviews || 0,
        recentReviews: allReviews.length,
        verified: true,
        logo: m.avatar || m.profilePhoto || null,
        location: m.city && m.state ? `${m.city}, ${m.state}` : null,
        engagementScore: m.pro_engagement?.engagementScore || 0,
      };
    });

    const profilePros = profiles.map((p) => ({
      id: p.id,
      name: p.companyName || p.contactName || "Professional",
      trade: p.specialties?.[0] || "Professional",
      rating: p.rating ? parseFloat(p.rating.toString()) : 0,
      reviewCount: p.reviewCount || 0,
      recentReviews: 0,
      verified: p.verified,
      logo: p.logoUrl || p.avatarUrl || null,
      location: p.city && p.state ? `${p.city}, ${p.state}` : null,
      engagementScore: 0,
    }));

    // Combine, deduplicate by name, sort by engagement/reviews
    const allPros = [...memberPros, ...profilePros]
      .sort((a, b) => {
        // Sort by engagement score first, then by recent reviews
        if (b.engagementScore !== a.engagementScore) {
          return b.engagementScore - a.engagementScore;
        }
        return b.recentReviews - a.recentReviews;
      })
      .slice(0, limit);

    return NextResponse.json({
      pros: allPros,
      total: allPros.length,
    });
  } catch (error) {
    console.error("[TrendingPros GET] Error:", error);
    return NextResponse.json({ pros: [], total: 0 });
  }
}
