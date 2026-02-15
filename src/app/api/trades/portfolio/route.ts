import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * POST /api/trades/portfolio
 * Add images to the authenticated user's portfolio
 * Portfolio images are stored directly on the tradesCompanyMember record
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrls } = body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "At least one image URL is required" }, { status: 400 });
    }

    // Get user's trades member profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Trades profile not found. Create your profile first." },
        { status: 404 }
      );
    }

    // Append new images to existing portfolio images
    const existingImages = member.portfolioImages || [];
    const updatedImages = [...existingImages, ...imageUrls];

    // Update member's portfolio images
    const updatedMember = await prisma.tradesCompanyMember.update({
      where: { userId },
      data: {
        portfolioImages: updatedImages,
      },
    });

    return NextResponse.json({
      success: true,
      portfolioImages: updatedMember.portfolioImages,
    });
  } catch (error) {
    console.error("[Portfolio API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to update portfolio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/trades/portfolio
 * Get portfolio images for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        portfolioImages: true,
      },
    });

    if (!member) {
      return NextResponse.json({ portfolioImages: [] });
    }

    return NextResponse.json({
      portfolioImages: member.portfolioImages || [],
    });
  } catch (error) {
    console.error("[Portfolio API GET] Error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}
