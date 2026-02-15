import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    // Determine if id is a UUID, Clerk userId, or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const isClerkId = /^user_/i.test(id);
    let isCompanyLookup = false;

    // First try to find as a tradesCompanyMember by primary key (only if id looks like a UUID)
    let member = isUUID
      ? await prisma.tradesCompanyMember.findUnique({
          where: { id },
          include: {
            company: true,
          },
        })
      : null;

    // If not found by pk, try by Clerk userId (covers message links that pass userId)
    if (!member && (isClerkId || !isUUID)) {
      member = await prisma.tradesCompanyMember
        .findUnique({
          where: { userId: id },
          include: { company: true },
        })
        .catch(() => null);
    }

    // If not found by member id, try company lookup
    if (!member) {
      const memberInclude = {
        members: {
          where: { isActive: true },
          take: 1 as const,
          orderBy: { isAdmin: "desc" as const },
          include: { company: true },
        },
      };

      // Try as a company UUID first, then fall back to slug
      const companyById = isUUID
        ? await prisma.tradesCompany.findUnique({ where: { id }, include: memberInclude })
        : null;

      const company =
        companyById ??
        (await prisma.tradesCompany.findFirst({ where: { slug: id }, include: memberInclude }));

      if (company?.members?.[0]) {
        member = company.members[0];
        isCompanyLookup = true;
      } else if (company) {
        // Company exists but has no members - return company-level data
        return NextResponse.json({
          profile: {
            id: company.id,
            firstName: null,
            lastName: null,
            jobTitle: "Company",
            avatar: company.logo || null,
            bio: company.description || null,
            businessName: company.name,
            coverPhotoUrl: company.coverimage || null,
            coverPhoto: company.coverimage || null,
            phone: company.phone,
            email: company.email,
            city: company.city,
            state: company.state,
            zip: company.zip,
            isVerified: company.isVerified || false,
            averageRating: company.rating ? parseFloat(String(company.rating)) : 0,
            totalReviewsCount: company.reviewCount || 0,
            isActive: (company as Record<string, unknown>).isPublic as boolean | undefined,
            specialties: company.specialties || [],
          },
        });
      }
    }

    // Legacy ID fallback (old company UUIDs that no longer exist)
    if (!member) {
      const legacyCompanyMap: Record<string, { slug?: string; name?: string }> = {
        "dc018500-e07f-4c95-a8f9-217161f732f0": { slug: "clearskai-technologies" },
      };

      const legacy = legacyCompanyMap[id];
      if (legacy?.slug || legacy?.name) {
        const legacyCompany = await prisma.tradesCompany.findFirst({
          where: legacy.slug ? { slug: legacy.slug } : { name: legacy.name },
          include: {
            members: {
              where: { isActive: true },
              take: 1,
              orderBy: { isAdmin: "desc" },
              include: { company: true },
            },
          },
        });

        if (legacyCompany?.members?.[0]) {
          member = legacyCompany.members[0];
        } else if (legacyCompany) {
          return NextResponse.json({
            profile: {
              id: legacyCompany.id,
              firstName: null,
              lastName: null,
              jobTitle: "Company",
              avatar: legacyCompany.logo || null,
              bio: legacyCompany.description || null,
              businessName: legacyCompany.name,
              coverPhotoUrl: legacyCompany.coverimage || null,
              coverPhoto: legacyCompany.coverimage || null,
              phone: legacyCompany.phone,
              email: legacyCompany.email,
              city: legacyCompany.city,
              state: legacyCompany.state,
              zip: legacyCompany.zip,
              isVerified: legacyCompany.isVerified || false,
              averageRating: legacyCompany.rating ? parseFloat(String(legacyCompany.rating)) : 0,
              totalReviewsCount: legacyCompany.reviewCount || 0,
              isActive: (legacyCompany as Record<string, unknown>).isPublic as boolean | undefined,
              specialties: legacyCompany.specialties || [],
            },
          });
        }
      }
    }

    if (!member) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Calculate average rating from reviews
    let avgRating = 0;
    let reviewCount = 0;
    try {
      const reviews = await prisma.trade_reviews.findMany({
        where: { contractorId: member.id },
      });
      reviewCount = reviews.length;
      avgRating =
        reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    } catch (reviewErr) {
      console.warn("[trades/profile/public] Reviews query failed (non-fatal):", reviewErr);
    }

    // Build comprehensive response
    const profileData = {
      // Basic Info
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      jobTitle: member.jobTitle || member.title || "Contractor",
      avatar: member.profilePhoto || member.avatar || null,
      bio: member.bio,
      yearsExperience: member.yearsExperience,
      specialties: member.specialties || [],
      workHistory: (() => {
        try {
          return member.workHistory ? JSON.parse(member.workHistory) : [];
        } catch {
          return [];
        }
      })(),
      lookingFor: member.lookingFor || [],
      skills: member.skills || [],
      certifications: member.certifications || [],

      // Company Info
      businessName: member.companyName || member.company?.name || "Independent Contractor",
      // Support both coverPhotoUrl (UI expects) and coverPhoto (DB field)
      coverPhotoUrl: member.coverPhoto || member.company?.coverimage || null,
      coverPhoto: member.coverPhoto || member.company?.coverimage || null,
      tagline: member.tagline || null,
      aboutCompany: member.aboutCompany || member.bio || null,
      foundedYear: member.foundedYear || null,
      teamSize: member.teamSize || null,

      // Contact Info
      phone: member.phone,
      officePhone: member.officePhone || member.phone,
      mobilePhone: member.mobilePhone || null,
      email: member.email,
      website: member.companyWebsite || null,

      // Location
      serviceAreas: member.serviceArea ? [member.serviceArea] : [],
      city: member.city,
      state: member.state,
      zip: member.zip,

      // Hours & Availability
      hoursOfOperation: member.hoursOfOperation || {},
      emergencyAvailable: member.emergencyAvailable || false,
      freeEstimates: member.freeEstimates !== false,

      // Licensing & Insurance
      rocNumber: member.rocNumber || member.companyLicense || null,
      rocExpiration: member.rocExpiration || null,
      insuranceProvider: member.insuranceProvider || null,
      insuranceExpiration: member.insuranceExpiration || null,
      bondAmount: member.bondAmount || null,
      isVerified: member.company?.isVerified || false,

      // Payment & Services
      paymentMethods: member.paymentMethods || [],
      languages: member.languages || ["English"],
      warrantyInfo: member.warrantyInfo || null,

      // Social & Portfolio
      socialLinks: member.socialLinks || {},
      portfolioUrls: member.portfolioImages || [],

      // Reviews & Rating
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviewsCount: reviewCount,

      // Company link
      companyId: member.company?.id || null,
      companySlug: member.company?.slug || null,
      companyLogo: member.company?.logo || null,

      // Meta
      tradeProfileId: member.id,
      isActive: member.isActive,
    };

    return NextResponse.json({
      profile: profileData,
      isCompanyProfile: isCompanyLookup,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[trades/profile/public] Error fetching profile for id="${id}":`, message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
