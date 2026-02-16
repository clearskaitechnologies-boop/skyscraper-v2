// ORG-SCOPE: Community feed — queries published trade_reviews. Cross-org by design (public marketplace content).
/**
 * Community Feed API
 * GET: Fetch posts from the community feed
 * POST: Create a new post
 */

import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId } = authResult;

    const { searchParams } = new URL(req.url);
    const trade = searchParams.get("trade");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Find client
    const client = await prisma.client.findUnique({
      where: { userId },
    });

    // Fetch published reviews as feed posts
    const whereClause: any = {
      status: "published",
    };

    const reviews = await prisma.trade_reviews.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            city: true,
            state: true,
          },
        },
        tradesCompanyMember: {
          select: {
            id: true,
            companyName: true,
            tradeType: true,
            avatar: true,
          },
        },
      },
    });

    // Transform reviews into feed posts
    const posts = reviews.map((review) => ({
      id: review.id,
      type: "review" as const,
      author: {
        id: review.Client?.id || "unknown",
        name:
          review.Client?.name ||
          `${review.Client?.firstName || ""} ${review.Client?.lastName || ""}`.trim() ||
          "Anonymous",
        avatar: review.Client?.avatarUrl || null,
        location:
          review.Client?.city && review.Client?.state
            ? `${review.Client.city}, ${review.Client.state}`
            : null,
      },
      content: review.comment || "",
      rating: review.rating,
      contractor: review.tradesCompanyMember
        ? {
            id: review.tradesCompanyMember.id,
            name: review.tradesCompanyMember.companyName || "Contractor",
            trade: review.tradesCompanyMember.tradeType || "Professional",
            rating: review.rating,
            verified: true,
            logo: review.tradesCompanyMember.avatar || null,
          }
        : null,
      projectType: review.jobType || null,
      likes: review.helpful || 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      createdAt: review.createdAt.toISOString(),
    }));

    return NextResponse.json({
      posts,
      hasMore: posts.length === limit,
      total: reviews.length,
    });
  } catch (error) {
    console.error("[CommunityFeed GET] Error:", error);
    return NextResponse.json({ posts: [], hasMore: false, total: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) return authResult;
    const { userId, email: authEmail } = authResult;

    // Need full Clerk user for profile metadata (firstName, lastName, imageUrl)
    const user = await currentUser();

    const body = await req.json();
    const { content, type, contractorId, rating, projectType, images } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Find or create client
    let client = await prisma.client.findUnique({
      where: { userId },
    });

    if (!client) {
      const email = authEmail || user?.emailAddresses?.[0]?.emailAddress || "";
      const displayName =
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || email.split("@")[0];

      client = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          slug: `client-${userId.slice(-8)}`,
          name: displayName,
          email,
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          avatarUrl: user?.imageUrl || null,
          category: "Homeowner",
          status: "active",
        },
      });
    }

    // If this is a review with a contractor, create a TradeReview
    if (type === "review" && contractorId && rating) {
      const review = await prisma.trade_reviews.create({
        data: {
          id: crypto.randomUUID(),
          contractorId,
          clientId: client.id,
          rating,
          comment: content.trim(),
          jobType: projectType || null,
          status: "published",
          verified: false,
        },
        include: {
          Client: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              city: true,
              state: true,
            },
          },
          tradesCompanyMember: {
            select: {
              id: true,
              companyName: true,
              tradeType: true,
              avatar: true,
            },
          },
        },
      });

      const post = {
        id: review.id,
        type: "review" as const,
        author: {
          id: client.id,
          name: client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim(),
          avatar: client.avatarUrl,
          location: client.city && client.state ? `${client.city}, ${client.state}` : null,
        },
        content: review.comment || "",
        rating: review.rating,
        contractor: review.tradesCompanyMember
          ? {
              id: review.tradesCompanyMember.id,
              name: review.tradesCompanyMember.companyName || "Contractor",
              trade: review.tradesCompanyMember.tradeType || "Professional",
              rating: review.rating,
              verified: true,
              logo: review.tradesCompanyMember.avatar,
            }
          : null,
        projectType: review.jobType,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        createdAt: review.createdAt.toISOString(),
      };

      return NextResponse.json({ post }, { status: 201 });
    }

    // For non-review posts, we would need a CommunityPost model
    // For now, return a mock post
    const post = {
      id: `post-${Date.now()}`,
      type: type || "update",
      author: {
        id: client.id,
        name: client.name || `${client.firstName || ""} ${client.lastName || ""}`.trim(),
        avatar: client.avatarUrl,
        location: client.city && client.state ? `${client.city}, ${client.state}` : null,
      },
      content: content.trim(),
      images: images || [],
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[CommunityFeed POST] Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
