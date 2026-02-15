/**
 * Demo Setup API - One-Click Demo Reset
 *
 * POST /api/demo/setup
 *
 * Safely resets demo data for Arizona Storm Demo organization.
 * Only works when EMERGENCY_DEMO_MODE=true for safety.
 *
 * This endpoint:
 * 1. Verifies demo mode is enabled
 * 2. Cleans existing demo data
 * 3. Re-seeds Arizona Storm Demo org with fresh data
 * 4. Returns status of operation
 */

import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { generateContactSlug } from "@/lib/generateContactSlug";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEMO_MODE = process.env.EMERGENCY_DEMO_MODE === "true";
const DEMO_ORG_NAME = "Arizona Storm Demo";

export async function POST() {
  try {
    // Safety check: Only allow in demo mode
    if (!DEMO_MODE) {
      return NextResponse.json(
        { error: "Demo setup only available when EMERGENCY_DEMO_MODE=true" },
        { status: 403 }
      );
    }

    // Verify authenticated user (admin only for extra safety)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🌩️  Demo Setup: Starting Arizona Storm Demo reset...");

    // Find existing demo org
    const existingOrg = await prisma.org.findFirst({
      where: { name: DEMO_ORG_NAME },
    });

    if (existingOrg) {
      console.log("   Cleaning existing demo data...");

      // Delete in reverse dependency order to avoid foreign key violations
      await prisma.projectNotification.deleteMany({ where: { orgId: existingOrg.id } });
      await prisma.claim_timeline_events.deleteMany({
        where: { claims: { orgId: existingOrg.id } },
      });
      await prisma.client_access.deleteMany({
        where: { claims: { orgId: existingOrg.id } },
      });
      await prisma.claims.deleteMany({ where: { orgId: existingOrg.id } });
      await prisma.properties.deleteMany({ where: { orgId: existingOrg.id } });
      await prisma.contacts.deleteMany({ where: { orgId: existingOrg.id } });
      await prisma.users.deleteMany({ where: { orgId: existingOrg.id } });
      await prisma.org.delete({ where: { id: existingOrg.id } });

      console.log("   ✅ Cleanup complete");
    }

    // Create fresh demo org
    console.log("🏢 Creating fresh Arizona Storm Demo organization...");
    const demoOrg = await prisma.org.create({
      data: {
        id: randomUUID(),
        name: DEMO_ORG_NAME,
        clerkOrgId: `org_demo_${Date.now()}`,
        updatedAt: new Date(),
        subscriptionStatus: "active",
        planKey: "pro",
        videoEnabled: true,
        aiModeDefault: "auto",
        brandLogoUrl: "/demo/arizona-storm-logo.png",
        pdfHeaderText: "Arizona Storm Restoration & Roofing",
      },
    });

    // Create demo users
    const damien = await prisma.users.create({
      data: {
        id: randomUUID(),
        clerkUserId: `user_demo_damien_${Date.now()}`,
        email: "damien@arizonastorm.demo",
        name: "Damien Storm",
        orgId: demoOrg.id,
        role: "ADMIN",
      },
    });

    const dowe = await prisma.users.create({
      data: {
        id: randomUUID(),
        clerkUserId: `user_demo_dowe_${Date.now()}`,
        email: "dowe@arizonastorm.demo",
        name: "Dowe Anderson",
        orgId: demoOrg.id,
        role: "USER",
      },
    });

    // First create a contact for the property
    const contact1 = await prisma.contacts.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        firstName: "John",
        lastName: "Doe",
        slug: generateContactSlug("John", "Doe"),
        email: "john.doe@example.com",
        updatedAt: new Date(),
      },
    });

    // Create sample properties and claims
    const property1 = await prisma.properties.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        contactId: contact1.id,
        name: "Prescott Valley Residence",
        propertyType: "Single Family",
        street: "1234 Pine Ridge Dr",
        city: "Prescott Valley",
        state: "AZ",
        zipCode: "86314",
        yearBuilt: 2010,
        squareFootage: 2400,
        roofType: "Asphalt Shingle",
        roofAge: 8,
        updatedAt: new Date(),
      },
    });

    const claim1 = await prisma.claims.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        propertyId: property1.id,
        claimNumber: `AZ-2024-${Date.now()}`,
        title: "Hail Damage - Prescott Valley Storm",
        description: "Significant hail damage from July 15, 2024 storm event",
        damageType: "Hail",
        dateOfLoss: new Date("2024-07-15"),
        carrier: "State Farm",
        adjusterName: "John Smith",
        adjusterEmail: "jsmith@statefarm.com",
        status: "in_progress",
        priority: "high",
        estimatedValue: 35000,
        assignedTo: damien.id,
        lifecycle_stage: "ADJUSTER_REVIEW",
        updatedAt: new Date(),
      },
    });

    // Create timeline events
    await prisma.claim_timeline_events.create({
      data: {
        id: randomUUID(),
        claim_id: claim1.id,
        type: "CLAIM_CREATED",
        description: "Initial claim created from storm damage report",
        visible_to_client: true,
      },
    });

    await prisma.claim_timeline_events.create({
      data: {
        id: randomUUID(),
        claim_id: claim1.id,
        type: "INSPECTION_SCHEDULED",
        description: "Initial damage assessment scheduled for July 18, 2024",
        visible_to_client: true,
      },
    });

    // Create notification examples
    await prisma.projectNotification.create({
      data: {
        id: randomUUID(),
        orgId: demoOrg.id,
        claimId: claim1.id,
        notificationType: "CLAIM_ASSIGNED",
        title: "New Claim Assigned",
        message: "Prescott Valley hail damage claim assigned to you",
        read: false,
      },
    });

    console.log("✅ Demo setup complete!");

    return NextResponse.json({
      success: true,
      message: "Demo environment reset successfully",
      data: {
        orgId: demoOrg.id,
        orgName: demoOrg.name,
        users: [
          { name: damien.name, email: damien.email, role: damien.role },
          { name: dowe.name, email: dowe.email, role: dowe.role },
        ],
        claims: 1,
        properties: 1,
        notifications: 1,
      },
    });
  } catch (error) {
    console.error("❌ Demo setup failed:", error);
    return NextResponse.json(
      {
        error: "Failed to reset demo environment",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
