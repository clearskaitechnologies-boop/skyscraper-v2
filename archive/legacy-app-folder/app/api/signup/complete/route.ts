// ============================================================================
// H-11: After Signup Organization Setup
// ============================================================================
//
// Handles post-signup flow:
//   1. Collect company information
//   2. Create organization in database
//   3. Link user to organization
//   4. Assign Starter tier
//   5. Initialize usage tracking
//   6. Redirect to onboarding wizard
//
// POST /api/signup/complete
// Body: { companyName, address, city, state, zipCode, phone }
// ============================================================================

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { companyName, address, city, state, zipCode, phone } = body;

    // Validate required fields
    if (!companyName) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    // Check if user already has an organization
    const existingUser = await db.user.findFirst({
      where: { clerkUserId: userId },
      include: { organization: true },
    });

    if (existingUser?.organizationId) {
      return NextResponse.json(
        { error: "User already has an organization", organizationId: existingUser.organizationId },
        { status: 400 }
      );
    }

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    // Create Clerk organization
    const clerkOrg = await clerkClient.organizations.createOrganization({
      name: companyName,
      createdBy: userId,
    });

    // Create organization in database with Starter tier
    const organization = await db.organization.create({
      data: {
        id: `org-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        clerkOrgId: clerkOrg.id,
        name: companyName,
        tier: "STARTER",
        claimsUsedThisMonth: 0,
        aiCreditsUsedThisMonth: 0,
        storageBytesUsed: 0,
        usagePeriodStart: new Date(),
      },
    });

    // Create user record linked to organization
    const user = await db.user.create({
      data: {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        role: "ADMIN",
        organizationId: organization.id,
      },
    });

    // Create contractor profile (optional)
    if (address || city || state || zipCode || phone) {
      await db.contractorProfile.create({
        data: {
          id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          orgId: organization.id,
          businessName: companyName,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          phone: phone || null,
          licenseNumber: null,
        },
      });
    }

    // TODO H-11: Send welcome email
    // await sendWelcomeEmail(user.email, companyName);

    // Log signup event
    console.log("[SIGNUP_COMPLETE]", {
      userId,
      organizationId: organization.id,
      companyName,
      tier: "STARTER",
    });

    return NextResponse.json({
      success: true,
      organizationId: organization.id,
      userId: user.id,
      tier: "STARTER",
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    console.error("[SIGNUP_COMPLETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to complete signup" }, { status: 500 });
  }
}
