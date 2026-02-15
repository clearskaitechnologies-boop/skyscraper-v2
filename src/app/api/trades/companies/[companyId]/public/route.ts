import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * Public Company API — No auth required
 * Serves company data for the public shareable company page
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;

  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      companyId
    );

    // Lookup by UUID or slug
    const company = isUUID
      ? await prisma.tradesCompany.findUnique({
          where: { id: companyId },
          include: {
            members: {
              where: { isActive: true },
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatar: true,
                profilePhoto: true,
                tradeType: true,
                role: true,
                isOwner: true,
                title: true,
                jobTitle: true,
                yearsExperience: true,
                certifications: true,
                tagline: true,
                foundedYear: true,
                bio: true,
              },
              orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
            },
            _count: {
              select: { members: true },
            },
          },
        })
      : await prisma.tradesCompany.findFirst({
          where: { slug: companyId },
          include: {
            members: {
              where: { isActive: true },
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatar: true,
                profilePhoto: true,
                tradeType: true,
                role: true,
                isOwner: true,
                title: true,
                jobTitle: true,
                yearsExperience: true,
                certifications: true,
                tagline: true,
                foundedYear: true,
                bio: true,
              },
              orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
            },
            _count: {
              select: { members: true },
            },
          },
        });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Fetch reviews
    let reviews: Array<{
      id: string;
      rating: number;
      title: string | null;
      comment: string | null;
      verified: boolean;
      createdAt: Date;
      Client: { name: string | null; avatarUrl: string | null } | null;
    }> = [];
    try {
      reviews = await prisma.trade_reviews.findMany({
        where: {
          contractorId: companyId,
          status: "published",
        },
        include: {
          Client: {
            select: { name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
    } catch {
      // Reviews table may not exist yet
    }

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : Number(company.rating) || 0;

    const ownerMember = company.members.find((m) => m.isOwner) || company.members[0];

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        description: company.description,
        logo: company.logo,
        coverimage: company.coverimage,
        phone: company.phone,
        email: company.email,
        website: company.website,
        city: company.city,
        state: company.state,
        zip: company.zip,
        serviceArea: company.serviceArea,
        specialties: company.specialties || [],
        licenseNumber: company.licenseNumber,
        isVerified: company.isVerified || false,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length || company.reviewCount || 0,
        teamSize: company._count.members,
        tagline: ownerMember?.tagline || null,
        foundedYear: ownerMember?.foundedYear || null,
        members: company.members.map((m) => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          avatar: m.profilePhoto || m.avatar,
          tradeType: m.tradeType,
          role: m.role,
          isOwner: m.isOwner,
          title: m.title || m.jobTitle,
          yearsExperience: m.yearsExperience,
          certifications: m.certifications,
        })),
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          verified: r.verified,
          createdAt: r.createdAt,
          clientName: r.Client?.name || "Anonymous",
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `[trades/companies/public] Error fetching company for id="${companyId}":`,
      message
    );
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
