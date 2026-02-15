/**
 * Trade Profile Me API
 * GET /api/trades/profile/me
 * Returns the current user's trade profile
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }

  try {
    // Get org context
    const { orgId } = await ensureUserOrgContext(userId);

    // PRIORITY 1: Check tradesCompanyMember (main trade profile table)
    const tradeMember = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });

    if (tradeMember) {
      return NextResponse.json({
        profile: {
          id: tradeMember.id,
          userId: tradeMember.userId,
          orgId: tradeMember.orgId,
          firstName: tradeMember.firstName,
          lastName: tradeMember.lastName,
          email: tradeMember.email,
          phone: tradeMember.phone,
          avatar: tradeMember.avatar || tradeMember.profilePhoto,
          coverPhoto: tradeMember.coverPhoto,
          tradeType: tradeMember.tradeType,
          specialties: tradeMember.specialties,
          companyName: tradeMember.companyName || tradeMember.company?.name,
          companyId: tradeMember.companyId,
          title: tradeMember.title || tradeMember.jobTitle,
          bio: tradeMember.bio,
          city: tradeMember.city,
          state: tradeMember.state,
          zip: tradeMember.zip,
          serviceArea: tradeMember.serviceArea,
          yearsExperience: tradeMember.yearsExperience,
          certifications: tradeMember.certifications,
          skills: tradeMember.skills,
          status: tradeMember.status,
          isOwner: tradeMember.isOwner,
          isAdmin: tradeMember.isAdmin,
          // Company info
          company: tradeMember.company
            ? {
                id: tradeMember.company.id,
                name: tradeMember.company.name,
                logo: tradeMember.company.logo,
                slug: tradeMember.company.slug,
              }
            : null,
        },
      });
    }

    // PRIORITY 2: Check ContractorProfile by orgId
    const profile = await prisma.contractor_profiles.findUnique({
      where: { orgId },
      include: {
        Org: true,
        _count: {
          select: {
            reviews: true,
            public_leads: true,
          },
        },
      },
    });

    if (profile) {
      // Build response from contractor_profiles fields
      const merged = {
        ...profile,
        tradeType: profile.primaryTrade || null,
        companyName: profile.businessName,
        yearsExperience: null,
        baseZip: null,
        serviceRadius: 50,
      };

      return NextResponse.json({ profile: merged });
    }

    // PRIORITY 3: Check for tradesCompany directly (fallback)
    const company = await prisma.tradesCompany.findFirst({
      where: {
        members: {
          some: { userId },
        },
      },
    });

    if (company) {
      return NextResponse.json({
        profile: {
          id: company.id,
          userId: userId,
          companyName: company.name,
          firstName: null,
          lastName: null,
          tradeType: null,
          specialties: [],
          city: null,
          state: null,
          avatar: company.logo,
          coverPhoto: null,
        },
      });
    }

    return NextResponse.json({ profile: null });
  } catch (error) {
    console.error("[trades/profile/me] Error:", error);
    return NextResponse.json({ profile: null });
  }
}
