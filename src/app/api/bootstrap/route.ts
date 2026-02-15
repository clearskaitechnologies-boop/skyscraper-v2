/**
 * Self-Bootstrap API - Creates user + org + membership from Clerk session
 *
 * GET /api/bootstrap - Auto-creates org for the currently signed-in user
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId, orgId: clerkOrgId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Not authenticated. Please sign in first.",
          action: "redirect",
          url: "/sign-in",
        },
        { status: 401 }
      );
    }

    // Check if user already has an org membership
    const existingMembership = await prisma.user_organizations.findFirst({
      where: { userId },
      include: { Org: true },
    });

    if (existingMembership?.organizationId) {
      const demoClaimId = `demo-claim-john-smith-${existingMembership.organizationId}`;

      return NextResponse.json({
        ok: true,
        status: "already_exists",
        userId,
        orgId: existingMembership.organizationId,
        orgName: existingMembership.Org?.name,
        links: {
          claims: `/claims`,
          demoClaim: `/claims/${demoClaimId}/overview`,
          dashboard: `/dashboard`,
        },
      });
    }

    // Get Clerk user details
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${userId}@skaiscrape.com`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "User";

    // Create new org
    const orgId = clerkOrgId || `org_${userId.slice(-8)}_${Date.now()}`;
    const effectiveClerkOrgId = clerkOrgId || `local_${userId.slice(-8)}`;

    const org = await prisma.org.create({
      data: {
        id: orgId,
        clerkOrgId: effectiveClerkOrgId,
        name: `${name}'s Organization`,
        updatedAt: new Date(),
      },
    });

    // Create membership
    await prisma.user_organizations.create({
      data: {
        userId,
        organizationId: org.id,
        role: "owner",
      },
    });

    // Create user record
    await prisma.users.upsert({
      where: { clerkUserId: userId },
      create: {
        id: userId,
        clerkUserId: userId,
        email,
        name,
        orgId: org.id,
      },
      update: {
        orgId: org.id,
      },
    });

    // Seed demo data
    const demoClaimId = `demo-claim-john-smith-${org.id}`;
    const contactId = `demo-contact-${org.id}`;
    const propertyId = `demo-property-${org.id}`;
    const contactSlug = `john-smith-${org.id.slice(-8)}`;

    // Create demo contact
    await prisma.contacts.upsert({
      where: { id: contactId },
      create: {
        id: contactId,
        orgId: org.id,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "(555) 123-4567",
        slug: contactSlug,
        updatedAt: new Date(),
      },
      update: {},
    });

    // Create demo property
    await prisma.properties.upsert({
      where: { id: propertyId },
      create: {
        id: propertyId,
        orgId: org.id,
        contactId: contactId,
        name: "4521 N 12th St",
        street: "4521 N 12th St",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85014",
        propertyType: "RESIDENTIAL",
        updatedAt: new Date(),
      },
      update: {},
    });

    // Create demo claim
    await prisma.claims.upsert({
      where: { id: demoClaimId },
      create: {
        id: demoClaimId,
        claimNumber: `CLM-${org.id.slice(0, 8)}-001`,
        title: "John Smith Roof Damage Claim",
        description:
          "Storm damage to roof from December 2025 hailstorm. Significant damage to shingles and gutters.",
        orgId: org.id,
        propertyId,
        status: "active",
        damageType: "STORM",
        carrier: "State Farm",
        dateOfLoss: new Date("2025-12-15"),
        adjusterName: "Alex Thompson",
        adjusterEmail: "alex.thompson@statefarm.com",
        adjusterPhone: "(555) 987-6543",
        estimatedValue: 15000,
        approvedValue: 0,
        deductible: 1000,
        updatedAt: new Date(),
      },
      update: {},
    });

    return NextResponse.json({
      ok: true,
      status: "created",
      userId,
      orgId: org.id,
      claimId: demoClaimId,
      message: "✅ Organization created with demo data!",
      links: {
        claims: `/claims`,
        demoClaim: `/claims/${demoClaimId}/overview`,
        dashboard: `/dashboard`,
      },
    });
  } catch (error: any) {
    console.error("[BOOTSTRAP] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
