/**
 * Bootstrap API - Creates user + org + membership for first-time setup
 * PUBLIC endpoint for debugging/demo purposes
 *
 * GET /api/public/bootstrap?userId=clerk_xxx - Creates demo org for user
 */

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const dryRun = searchParams.get("dryRun") === "true";

  if (!userId) {
    return NextResponse.json(
      {
        ok: false,
        error: "userId is required. Pass ?userId=your_clerk_user_id",
      },
      { status: 400 }
    );
  }

  try {
    // Check if user already has an org membership
    const existingMembership = await prisma.user_organizations.findFirst({
      where: { userId },
      include: { Org: true },
    });

    if (existingMembership?.organizationId) {
      return NextResponse.json({
        ok: true,
        status: "already_exists",
        userId,
        orgId: existingMembership.organizationId,
        orgName: existingMembership.Org?.name,
        message: "User already has org membership",
      });
    }

    // Check for orphan user record
    const existingUser = await prisma.users.findFirst({
      where: { clerkUserId: userId },
      select: { id: true, email: true, orgId: true },
    });

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        status: "dry_run",
        wouldCreate: {
          org: !existingMembership,
          membership: !existingMembership,
          user: !existingUser,
        },
        existingUser,
        existingMembership,
      });
    }

    // Create new org
    const orgId = `org_${userId.slice(-8)}_${Date.now()}`;
    const clerkOrgId = `local_${userId.slice(-8)}`;

    const org = await prisma.org.create({
      data: {
        id: orgId,
        clerkOrgId,
        name: "My Organization",
        updatedAt: new Date(),
      },
    });

    // Create membership
    const membership = await prisma.user_organizations.create({
      data: {
        userId,
        organizationId: org.id,
        role: "owner",
      },
    });

    // Create user record if needed
    let userRecord = existingUser;
    if (!existingUser) {
      userRecord = await prisma.users.create({
        data: {
          id: userId,
          clerkUserId: userId,
          email: `${userId}@demo.skaiscrape.com`,
          name: "Demo User",
          orgId: org.id,
        },
      });
    }

    // Seed demo data for the org
    const demoClaimId = `demo-claim-john-smith-${org.id}`;
    const existingClaim = await prisma.claims.findUnique({
      where: { id: demoClaimId },
    });

    if (!existingClaim) {
      // Create demo contact
      const contactId = `demo-contact-${org.id}`;
      const contactSlug = `john-smith-${org.id.slice(-8)}`;
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
      const propertyId = `demo-property-${org.id}`;
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
      await prisma.claims.create({
        data: {
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
      });
    }

    return NextResponse.json({
      ok: true,
      status: "created",
      userId,
      orgId: org.id,
      membershipId: membership.id,
      claimId: demoClaimId,
      message: "Successfully bootstrapped user, org, and demo data",
      links: {
        claims: `/claims`,
        demoClaim: `/claims/${demoClaimId}/overview`,
        diag: `/api/diag/org`,
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
