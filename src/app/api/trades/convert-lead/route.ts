/**
 * Convert Lead API
 * Converts a ClientWorkRequest into different project types:
 * - claim: Insurance claim
 * - repair: Standard repair/service job
 * - oop: Out of pocket (client pays directly)
 * - financed: Payment plan or financing
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, conversionType, notes } = body;

    if (!requestId || !conversionType) {
      return NextResponse.json(
        { error: "requestId and conversionType are required" },
        { status: 400 }
      );
    }

    // Valid conversion types
    const validTypes = ["claim", "repair", "oop", "financed"];
    if (!validTypes.includes(conversionType)) {
      return NextResponse.json(
        { error: "Invalid conversionType. Must be: claim, repair, oop, or financed" },
        { status: 400 }
      );
    }

    // Find the work request with client info
    const workRequest = await prisma.clientWorkRequest.findFirst({
      where: { id: requestId },
      include: {
        Client: true,
        tradesCompany: true,
      },
    });

    if (!workRequest) {
      return NextResponse.json({ error: "Work request not found" }, { status: 404 });
    }

    // Get the tradesCompany for this user's member profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: { companyId: true },
    });

    if (!member?.companyId) {
      return NextResponse.json({ error: "No trades company found for this user" }, { status: 404 });
    }

    const tradesCompany = await prisma.tradesCompany.findUnique({
      where: { id: member.companyId },
    });

    if (!tradesCompany) {
      return NextResponse.json({ error: "Trades company not found" }, { status: 404 });
    }

    // Get or create an admin user for this org
    const adminUser = await prisma.users.findFirst({
      where: { orgId },
      orderBy: { createdAt: "asc" },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "No user found for this org" }, { status: 404 });
    }

    // Create result based on conversion type
    let result: Record<string, unknown> = {};
    const projectId = uuidv4();
    const timestamp = new Date();

    // Base project data (used for all types)
    const baseProjectData = {
      id: projectId,
      orgId,
      title: workRequest.title,
      status: "LEAD" as const,
      stage: "Lead",
      createdBy: adminUser.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: notes || workRequest.description,
      valueEstimate: null,
    };

    switch (conversionType) {
      case "claim": {
        // Create property first if address exists
        let propertyId: string | null = null;
        if (workRequest.propertyAddress) {
          const property = await prisma.properties.create({
            data: {
              id: uuidv4(),
              orgId,
              contactId: adminUser.id, // Placeholder
              name: workRequest.propertyAddress,
              propertyType: "Residential",
              street: workRequest.propertyAddress,
              city: "",
              state: "",
              zipCode: "",
              createdAt: timestamp,
              updatedAt: timestamp,
            },
          });
          propertyId = property.id;
        }

        // Create claim
        const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}`;
        const claim = await prisma.claims.create({
          data: {
            id: uuidv4(),
            orgId,
            propertyId: propertyId || uuidv4(), // Will need a property
            claimNumber,
            title: workRequest.title,
            description: workRequest.description,
            damageType: workRequest.category,
            dateOfLoss: workRequest.preferredDate || timestamp,
            status: "new",
            priority: workRequest.urgency === "emergency" ? "high" : "medium",
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        });

        result = {
          type: "claim",
          claimId: claim.id,
          claimNumber: claim.claimNumber,
          redirectUrl: `/claims/${claim.id}`,
        };
        break;
      }

      case "repair": {
        // Create a project with repair stage
        const project = await prisma.projects.create({
          data: {
            ...baseProjectData,
            stage: "Repair",
            jobNumber: `RPR-${Date.now().toString(36).toUpperCase()}`,
          },
        });

        result = {
          type: "repair",
          projectId: project.id,
          jobNumber: project.jobNumber,
          redirectUrl: `/jobs/${project.id}`,
        };
        break;
      }

      case "oop": {
        // Create a project marked as out-of-pocket
        const project = await prisma.projects.create({
          data: {
            ...baseProjectData,
            stage: "Out of Pocket",
            jobNumber: `OOP-${Date.now().toString(36).toUpperCase()}`,
            notes: `[Out of Pocket - Client Pays Directly]\n\n${notes || workRequest.description}`,
          },
        });

        result = {
          type: "oop",
          projectId: project.id,
          jobNumber: project.jobNumber,
          redirectUrl: `/jobs/${project.id}`,
        };
        break;
      }

      case "financed": {
        // Create a project marked as financed
        const project = await prisma.projects.create({
          data: {
            ...baseProjectData,
            stage: "Financed",
            jobNumber: `FIN-${Date.now().toString(36).toUpperCase()}`,
            notes: `[Financed - Payment Plan]\n\n${notes || workRequest.description}`,
          },
        });

        result = {
          type: "financed",
          projectId: project.id,
          jobNumber: project.jobNumber,
          redirectUrl: `/jobs/${project.id}`,
        };
        break;
      }
    }

    // Update the work request status to converted
    await prisma.clientWorkRequest.update({
      where: { id: requestId },
      data: {
        status: "converted",
        updatedAt: timestamp,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Lead converted to ${conversionType} successfully`,
      ...result,
    });
  } catch (error) {
    console.error("Convert lead error:", error);
    return NextResponse.json({ error: "Failed to convert lead" }, { status: 500 });
  }
}
