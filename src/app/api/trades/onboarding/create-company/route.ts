import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getResolvedOrgId } from "@/lib/auth/getResolvedOrgId";
import prisma from "@/lib/prisma";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      tradeTypes,
      serviceArea,
      yearsInBusiness,
      licenseNumber,
      insuranceProvider,
      insurancePolicyNumber,
      website,
      phone,
      address,
      city,
      state,
      zip,
    } = body;

    // Validation
    if (!companyName || !tradeTypes || tradeTypes.length === 0) {
      return NextResponse.json(
        { error: "Company name and at least one trade type are required" },
        { status: 400 }
      );
    }

    // Use createIfMissing: true to auto-create org for trades onboarding
    const orgId = await getResolvedOrgId();

    // Check if user is a trades employee (TradesCompanyMember)
    const employee = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee profile not found" }, { status: 404 });
    }

    if (!employee.isAdmin) {
      return NextResponse.json(
        { error: "Only admins can create company profiles" },
        { status: 403 }
      );
    }

    if (!employee.pendingCompanyToken) {
      return NextResponse.json({ error: "No pending company found" }, { status: 400 });
    }

    const slug = slugify(companyName);
    if (!slug) {
      return NextResponse.json({ error: "Invalid company name" }, { status: 400 });
    }

    const existingSlug = await prisma.tradesCompany.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }

    // Create company
    const company = await prisma.tradesCompany.create({
      data: {
        id: crypto.randomUUID(),
        name: companyName,
        slug,
        website: website || null,
        phone: phone || null,
        email: null,
        address: address || null,
        city: city || null,
        state: state || "AZ",
        zip: zip || null,
        specialties: tradeTypes || [],
        yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
        licenseNumber: licenseNumber || null,
        serviceArea: serviceArea ? [serviceArea] : [],
        isActive: true,
      },
    });

    // Link all pending employees to this company
    await prisma.tradesCompanyMember.updateMany({
      where: {
        pendingCompanyToken: employee.pendingCompanyToken,
        companyId: null,
        status: "active",
      },
      data: {
        companyId: company.id,
        onboardingStep: "complete",
        canEditCompany: true,
      },
    });

    // Mark invite as used
    if (employee.pendingCompanyToken) {
      try {
        await prisma.tradesOnboardingInvite.updateMany({
          where: {
            token: employee.pendingCompanyToken,
            status: "pending",
          },
          data: {
            status: "accepted",
            acceptedAt: new Date(),
          },
        });
      } catch (inviteError) {
        // Invite record may not exist for manually created members — non-fatal
        console.log("[trades/onboarding/create-company] Invite token update skipped:", inviteError);
      }
    }

    return NextResponse.json({
      success: true,
      company,
      message: "Company created successfully",
    });
  } catch (error: any) {
    console.error("[TRADES_CREATE_COMPANY_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
