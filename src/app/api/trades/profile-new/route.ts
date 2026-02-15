/**
 * QA: Trade Profile API Route
 * Test Steps:
 * 1. Fill out /dashboard/trades/profile form → Save
 * 2. Refresh page → Values should persist
 * 3. Navigate to /vendors → Your company should appear as a card
 * 4. Click vendor card → Detail page shows your real contact info
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { ensureVendorForOrg } from "@/lib/trades/vendorSync";

// GET /api/trades/profile - Get current user's trade profile
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    const orgId = (user?.publicMetadata?.orgId as string) || userId;

    // Get ContractorProfile
    const contractorProfile = await prisma.tradesCompanyMember.findFirst({
      where: { orgId },
    });

    if (!contractorProfile) {
      return NextResponse.json({ profile: null });
    }

    // Flatten for form compatibility
    const profile = {
      id: contractorProfile.id,
      businessName: contractorProfile.companyName,
      companyName: contractorProfile.companyName,
      email: contractorProfile.email,
      phone: contractorProfile.phone,
      licenseNumber: contractorProfile.companyLicense,
      website: contractorProfile.companyWebsite,
      bio: contractorProfile.bio,
      shortBio: contractorProfile.bio,
      yearsExperience: contractorProfile.yearsExperience,
      insuranceVerified: !!contractorProfile.insuranceProvider,

      // Trade-specific fields
      tradeType: contractorProfile.tradeType,
      baseZip: contractorProfile.zip,
      serviceRadius: contractorProfile.serviceArea,
      radiusMiles: contractorProfile.serviceArea,
      specialties: contractorProfile.specialties || [],
      portfolioImages: contractorProfile.portfolioImages || [],
      videoUrls: [],
      completedJobsCount: 0,
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[GET /api/trades/profile] Error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

// POST/PATCH /api/trades/profile - Create or update trade profile
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const orgId = (user.publicMetadata?.orgId as string) || userId;
    const body = await req.json();

    // Check if profile exists
    const existing = await prisma.tradesCompanyMember.findFirst({
      where: { orgId },
    });

    // Prepare ContractorProfile data
    const contractorData = {
      companyName: body.businessName || body.companyName,
      email: body.email || user.emailAddresses[0]?.emailAddress,
      phone: body.phone,
      companyLicense: body.licenseNumber,
      companyWebsite: body.website,
      bio: body.bio || body.shortBio,
      specialties: body.specialties || [],
      zip: body.baseZip,
      serviceArea: body.serviceRadius || body.radiusMiles,
      yearsExperience: body.yearsExperience,
      insuranceProvider: body.insuranceVerified ? "Verified" : null,
      tradeType: body.tradeType || "General Contracting",
      portfolioImages: body.portfolioImages || [],
    };

    let contractorProfile;

    if (existing) {
      // Update existing
      contractorProfile = await prisma.tradesCompanyMember.update({
        where: { id: existing.id },
        data: contractorData,
      });
    } else {
      // Create new
      contractorProfile = await prisma.tradesCompanyMember.create({
        data: {
          ...contractorData,
          orgId,
          userId,
        },
      });
    }

    // Sync to vendor directory
    const updatedProfile = await prisma.tradesCompanyMember.findUnique({
      where: { id: contractorProfile.id },
    });

    if (updatedProfile) {
      await ensureVendorForOrg(orgId, updatedProfile, null);
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...body,
        id: contractorProfile.id,
      },
    });
  } catch (error) {
    console.error("[POST /api/trades/profile] Error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}
