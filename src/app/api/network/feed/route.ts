import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * GET /api/network/feed
 *
 * Unified network feed that pulls content from:
 * - TradesPost (contractor updates)
 * - Reviews (client reviews)
 * - TradesCompany (company updates)
 *
 * This powers both the Client Community Hub and Trades Network
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const tradeFilter = searchParams.get("trade") || "";
    const search = searchParams.get("search") || "";

    // Fetch posts from TradesPost
    // NOTE: tradesPost/trade_reviews have no orgId — intentionally cross-org community feed
    const tradesPosts = await prisma.tradesPost
      .findMany({
        where: {
          active: true,
          ...(search
            ? {
                OR: [{ content: { contains: search, mode: "insensitive" } }],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          TradesProfile: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              logoUrl: true,
              verified: true,
              city: true,
              state: true,
              specialties: true,
            },
          },
        },
      })
      .catch(() => []);

    // Fetch recent reviews (for the feed)
    const reviews = await prisma.trade_reviews
      .findMany({
        where: {
          status: "published",
          ...(search
            ? {
                OR: [
                  { comment: { contains: search, mode: "insensitive" } },
                  { title: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          tradesCompanyMember: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              specialties: true,
            },
          },
        },
      })
      .catch(() => []);

    // Get user's liked post IDs to check isLiked status
    const userLikes = await prisma.trades_feed_engagement
      .findMany({
        where: { user_id: userId, liked: true },
        select: { post_id: true },
      })
      .catch(() => []);
    const likedPostIds = new Set(userLikes.map((l) => l.post_id));

    // Transform into unified feed format
    const feedItems = [
      ...tradesPosts.map((post: any) => ({
        id: post.id,
        type: post.postType || "update",
        author: {
          id: post.company?.id || post.companyId,
          name: post.company?.name || "Unknown Company",
          avatar: post.company?.logo || null,
          location: post.company
            ? `${post.company.city || ""}, ${post.company.state || ""}`
                .trim()
                .replace(/^,\s*|,\s*$/g, "")
            : null,
          verified: post.company?.verified || false,
          isPro: true,
        },
        content: post.content,
        images: post.imageUrls || [],
        likes: post.likeCount || 0,
        comments: post.commentCount || 0,
        shares: 0,
        isLiked: likedPostIds.has(post.id),
        createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
        projectType: post.projectType || null,
        contractor: post.company
          ? {
              id: post.company.id,
              name: post.company.name,
              trade: post.company.specialties?.[0] || "General",
              verified: post.company.verified,
              logo: post.company.logo,
            }
          : null,
      })),
      ...reviews.map((review: any) => ({
        id: `review-${review.id}`,
        type: "review",
        author: {
          id: review.authorId || "anonymous",
          name: review.authorName || "Anonymous",
          avatar: null,
          location: null,
          verified: review.isVerified || false,
          isPro: false,
        },
        content: review.content || "",
        images: [],
        rating: review.rating,
        likes: review.helpfulCount || 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: review.createdAt?.toISOString() || new Date().toISOString(),
        contractor: review.company
          ? {
              id: review.company.id,
              name: review.company.name,
              trade: review.company.specialties?.[0] || "General",
              verified: review.company.verified,
              logo: review.company.logo,
            }
          : null,
      })),
    ];

    // Sort by date
    feedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      posts: feedItems.slice(0, limit),
      hasMore: feedItems.length >= limit,
      total: feedItems.length,
    });
  } catch (error: any) {
    console.error("[Network Feed] Error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
