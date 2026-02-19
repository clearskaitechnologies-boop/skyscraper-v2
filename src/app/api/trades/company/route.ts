import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/security/roles";

// Minimum members to unlock company page (can be overridden by plan)
// Set to 1 so every registered user can access their company page
const MIN_MEMBERS_FOR_COMPANY_PAGE = 1;

// Plans that unlock company page regardless of member count
// Solo: 1 seat ($29.99) - needs upgrade or 3+ members
// Business: 10 seats ($139.99) - unlocked
// Enterprise: 25 seats ($399.99) - unlocked
const COMPANY_PAGE_PLANS = [
  "free", // Free tier — always show company page
  "solo", // Solo plan — your company page is yours
  "solo_plus", // Solo with addon seats
  "business",
  "enterprise",
  // Legacy plan mappings
  "starter",
  "pro",
  "pro_plus",
  "team",
  "unlimited",
];

export const GET = withAuth(async (req: NextRequest, { orgId, userId }) => {
  try {
    // Find the user's company membership
    const membership = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: {
        company: {
          include: {
            members: {
              where: { isActive: true, status: "active" },
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatar: true,
                profilePhoto: true,
                role: true,
                isOwner: true,
                isAdmin: true,
                title: true,
                tradeType: true,
              },
            },
          },
        },
      },
    });

    // Check if company page is unlocked
    let companyPageUnlocked = false;
    let unlockReason: string | null = null;
    let requirementsToUnlock: Record<string, any> | null = null;
    let planKey = "solo";

    // Platform admin always has access (bypasses plan/seat requirements)
    const platformAdmin = await isPlatformAdmin();
    if (platformAdmin) {
      companyPageUnlocked = true;
      unlockReason = "platform_admin";
    }

    // Use orgId from withAuth — already DB-backed and server-resolved
    try {
      const org = await prisma.org.findUnique({
        where: { id: orgId },
        select: { planKey: true },
      });
      planKey = org?.planKey || "solo";
    } catch (e) {
      // Org lookup may fail for edge cases, use default
    }

    const memberCount = membership?.company?.members?.length || 1;

    if (!companyPageUnlocked) {
      const planUnlocksCompanyPage = COMPANY_PAGE_PLANS.includes(planKey);
      const memberCountUnlocksPage = memberCount >= MIN_MEMBERS_FOR_COMPANY_PAGE;
      companyPageUnlocked = planUnlocksCompanyPage || memberCountUnlocksPage;

      if (companyPageUnlocked) {
        unlockReason = planUnlocksCompanyPage ? "plan" : "member_count";
      } else {
        requirementsToUnlock = {
          needsPlan: COMPANY_PAGE_PLANS[0],
          orNeedsMembers: MIN_MEMBERS_FOR_COMPANY_PAGE,
          currentMembers: memberCount,
          currentPlan: planKey,
        };
      }
    }

    if (!membership?.company) {
      // Auto-create a company for users who have a member profile but no company
      // This ensures the company page always works once the user has onboarded
      // IMPORTANT: Never use firstName+lastName as company name — that creates
      // ghost companies like "Damien Ray" when Clerk has different name data
      if (membership) {
        try {
          // Only use an explicit company name from the membership record.
          // Never fall back to user?.name — that would use a personal name
          // and create ghost companies like "Damien's Company".
          const companyName = membership.companyName || "My Company";

          const newCompany = await prisma.tradesCompany.create({
            data: {
              name: companyName,
              slug: `company-${membership.id.slice(-8)}`,
              description: "",
              members: {
                connect: { id: membership.id },
              },
            },
            include: {
              members: {
                where: { isActive: true, status: "active" },
                select: {
                  id: true,
                  userId: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  profilePhoto: true,
                  role: true,
                  isOwner: true,
                  isAdmin: true,
                  title: true,
                  tradeType: true,
                },
              },
            },
          });

          // Make this user the owner
          await prisma.tradesCompanyMember.update({
            where: { id: membership.id },
            data: { isOwner: true, isAdmin: true, role: "owner" },
          });

          logger.debug(`[trades/company] Auto-created company "${companyName}" for user ${userId}`);

          return NextResponse.json({
            ok: true,
            company: {
              ...newCompany,
              coverPhoto: newCompany.coverimage || null,
              // Merge profilePhoto fallback into avatar for each member
              members: newCompany.members.map((m: any) => ({
                ...m,
                avatar: m.avatar || m.profilePhoto || null,
              })),
            },
            memberSettings: {},
            hasCompany: true,
            isAdmin: true,
            isOwner: true,
            canEditCompany: true,
            companyPageUnlocked: true,
            unlockReason: "auto_created",
            requirementsToUnlock: null,
            memberCount: 1,
          });
        } catch (autoCreateError) {
          logger.error("[trades/company] Auto-create failed:", autoCreateError);
        }
      }

      return NextResponse.json(
        {
          ok: false,
          error: "No company found for user",
          hasCompany: false,
          hasProfile: !!membership,
          companyPageUnlocked,
          unlockReason,
          requirementsToUnlock,
        },
        { status: 404 }
      );
    }

    // Also fetch the requesting member's extended fields (tagline, hours, etc.)
    const memberExtended = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        tagline: true,
        aboutCompany: true,
        foundedYear: true,
        teamSize: true,
        hoursOfOperation: true,
        officePhone: true,
        mobilePhone: true,
        emergencyAvailable: true,
        freeEstimates: true,
        warrantyInfo: true,
        socialLinks: true,
        paymentMethods: true,
        languages: true,
        rocNumber: true,
        insuranceProvider: true,
        coverPhoto: true,
      },
    });

    // For cover photo: use company-level coverimage first, then try the owner's coverPhoto
    let companyCoverPhoto = membership.company.coverimage || memberExtended?.coverPhoto || null;
    if (!companyCoverPhoto) {
      // Fallback: look for the owner/admin's coverPhoto so all members see the same one
      const ownerMember = await prisma.tradesCompanyMember.findFirst({
        where: { companyId: membership.companyId, isOwner: true },
        select: { coverPhoto: true },
      });
      companyCoverPhoto = ownerMember?.coverPhoto || null;
    }

    return NextResponse.json({
      ok: true,
      company: {
        ...membership.company,
        // Map coverimage -> coverPhoto for frontend
        coverPhoto: companyCoverPhoto,
        // Merge profilePhoto fallback into avatar so team photos always render
        members: membership.company.members.map((m: any) => ({
          ...m,
          avatar: m.avatar || m.profilePhoto || null,
        })),
      },
      // Include member-level extended settings
      memberSettings: memberExtended || {},
      hasCompany: true,
      isAdmin:
        membership.role === "admin" ||
        membership.role === "owner" ||
        membership.isOwner ||
        membership.isAdmin,
      isOwner: membership.isOwner,
      canEditCompany: membership.isOwner || membership.isAdmin || membership.canEditCompany,
      companyPageUnlocked,
      unlockReason,
      requirementsToUnlock,
      memberCount,
    });
  } catch (error) {
    logger.error("[trades/company] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req: NextRequest, { orgId, userId }) => {
  try {
    const body = await req.json();
    const {
      name,
      description,
      logo,
      coverPhoto,
      website,
      phone,
      email,
      address,
      city,
      state,
      zip,
      specialties,
      yearsInBusiness,
      licenseNumber,
      // licenseState removed — field does not exist in Prisma schema (ghost field)
      // Extended member-level fields (saved to member profile)
      tagline,
      aboutCompany,
      motto,
      foundedYear,
      teamSize,
      hoursOfOperation,
      officePhone,
      mobilePhone,
      emergencyAvailable,
      freeEstimates,
      warrantyInfo,
      socialLinks,
      paymentMethods,
      languages,
      rocNumber,
      insuranceProvider,
    } = body;

    // Find the user's company membership
    const membership = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!membership?.companyId) {
      return NextResponse.json({ error: "No company found for user" }, { status: 404 });
    }

    // Check if user has admin privileges
    const isAdminUser =
      membership.role === "admin" ||
      membership.role === "owner" ||
      membership.isOwner ||
      membership.isAdmin;
    if (!isAdminUser) {
      return NextResponse.json({ error: "Only admins can edit company details" }, { status: 403 });
    }

    // Build update data for TradesCompany — only include provided fields
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    // Schema column is 'coverimage' (not 'coverPhoto')
    if (coverPhoto !== undefined) updateData.coverimage = coverPhoto;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (yearsInBusiness !== undefined)
      updateData.yearsInBusiness = parseInt(yearsInBusiness) || null;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;

    const updated = await prisma.tradesCompany.update({
      where: { id: membership.companyId },
      data: updateData,
    });

    // Also update member-level extended fields (tagline, hours, etc.)
    const memberUpdate: Record<string, any> = {};
    if (tagline !== undefined) memberUpdate.tagline = tagline;
    if (aboutCompany !== undefined) memberUpdate.aboutCompany = aboutCompany;
    if (motto !== undefined) memberUpdate.tagline = motto; // motto maps to tagline
    if (foundedYear !== undefined) memberUpdate.foundedYear = parseInt(foundedYear) || null;
    if (teamSize !== undefined) memberUpdate.teamSize = teamSize;
    if (hoursOfOperation !== undefined) memberUpdate.hoursOfOperation = hoursOfOperation;
    if (officePhone !== undefined) memberUpdate.officePhone = officePhone;
    if (mobilePhone !== undefined) memberUpdate.mobilePhone = mobilePhone;
    if (emergencyAvailable !== undefined) memberUpdate.emergencyAvailable = emergencyAvailable;
    if (freeEstimates !== undefined) memberUpdate.freeEstimates = freeEstimates;
    if (warrantyInfo !== undefined) memberUpdate.warrantyInfo = warrantyInfo;
    if (socialLinks !== undefined) memberUpdate.socialLinks = socialLinks;
    if (paymentMethods !== undefined) memberUpdate.paymentMethods = paymentMethods;
    if (languages !== undefined) memberUpdate.languages = languages;
    if (rocNumber !== undefined) memberUpdate.rocNumber = rocNumber;
    if (insuranceProvider !== undefined) memberUpdate.insuranceProvider = insuranceProvider;
    // NOTE: coverPhoto is NOT dual-written to member — company cover photo
    // lives only on tradesCompany.coverimage. Member coverPhoto is for
    // individual pro profile cover photos (separate surface).

    if (Object.keys(memberUpdate).length > 0) {
      memberUpdate.updatedAt = new Date();
      await prisma.tradesCompanyMember.update({
        where: { id: membership.id },
        data: memberUpdate,
      });
    }

    return NextResponse.json({
      ok: true,
      company: { ...updated, coverPhoto: updated.coverimage },
    });
  } catch (error) {
    logger.error("[trades/company] PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
  }
});
