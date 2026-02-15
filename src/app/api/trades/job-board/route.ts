/**
 * Job Board API
 *
 * GET /api/trades/job-board
 * Returns job posts (ClientWorkRequests without targetPro) that are within
 * the contractor's service area.
 */

import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Simple distance calculation using zip codes (rough approximation)
function estimateDistance(zip1: string, zip2: string): number {
  // This is a placeholder - in production you'd use a geocoding service
  // For now, we'll just compare zip code prefixes for rough proximity
  if (!zip1 || !zip2) return 999;

  // Same zip = 0 miles
  if (zip1 === zip2) return 0;

  // Same 3-digit prefix = roughly same area (within ~50 miles)
  if (zip1.substring(0, 3) === zip2.substring(0, 3)) return 25;

  // Same 2-digit prefix = same region (within ~100 miles)
  if (zip1.substring(0, 2) === zip2.substring(0, 2)) return 75;

  // Different region = far away
  return 200;
}

// Extract city name from an address string (privacy-friendly location hint)
function extractCity(address: string): string | null {
  if (!address) return null;
  // Try to extract city from typical address format: "123 Main St, City, ST 12345"
  const parts = address.split(",");
  if (parts.length >= 2) {
    // Usually city is second-to-last part before state/zip
    const cityPart = parts[parts.length - 2]?.trim();
    if (cityPart && !cityPart.match(/^\d/)) {
      return cityPart;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Find the tradesCompanyMember for this user, then get their company
    const member = await prisma.tradesCompanyMember.findFirst({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            zip: true,
            specialties: true,
            serviceArea: true,
          },
        },
      },
    });

    const tradesCompany = member?.company;

    if (!tradesCompany) {
      return NextResponse.json({
        jobs: [],
        message: "No trades company found. Complete your profile to see job opportunities.",
      });
    }

    // Get service radius - serviceArea is a string array of zip codes or regions
    // Default to 50 miles radius for proximity filtering
    const serviceRadius = 50;
    // serviceArea contains the list of service area zip codes/regions
    const serviceAreas = tradesCompany.serviceArea || [];

    // Build query for open job posts (no targetPro = public job board)
    const whereClause: Prisma.ClientWorkRequestWhereInput = {
      targetProId: null, // Only public job board posts
      status: { in: ["pending", "open"] },
    };

    // Filter by category if provided
    if (category) {
      whereClause.category = category;
    }

    // Fetch all open jobs
    const allJobs = await prisma.clientWorkRequest.findMany({
      where: whereClause,
      include: {
        Client: {
          select: {
            id: true,
            name: true,
            address: true,
            email: true,
            phone: true,
            avatarUrl: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: [
        { urgency: "asc" }, // emergencies first
        { createdAt: "desc" },
      ],
      take: 100,
    });

    // Filter by service area (using propertyAddress or client address)
    const filteredJobs = allJobs.filter((job) => {
      // Extract zip from property address or client address
      const addressToCheck = job.propertyAddress || job.Client?.address || "";
      const zipMatch = addressToCheck.match(/\b\d{5}(?:-\d{4})?\b/);
      const jobZip = zipMatch ? zipMatch[0].substring(0, 5) : "";

      if (!jobZip || !tradesCompany.zip) {
        // If we can't determine location, include it (let pro decide)
        return true;
      }

      const distance = estimateDistance(tradesCompany.zip, jobZip);
      return distance <= serviceRadius;
    });

    // Check if pro is connected to each client (for privacy)
    const clientIds = [...new Set(filteredJobs.map((job) => job.clientId))];
    const connections = await prisma.clientProConnection.findMany({
      where: {
        contractorId: tradesCompany.id,
        clientId: { in: clientIds },
        status: "connected",
      },
      select: { clientId: true },
    });
    const connectedClientIds = new Set(connections.map((c) => c.clientId));

    // Also check if job category matches pro's specialties
    const matchingJobs = filteredJobs.map((job) => {
      const isMatch = tradesCompany.specialties?.some(
        (s) =>
          s.toLowerCase().includes(job.category.toLowerCase()) ||
          job.category.toLowerCase().includes(s.toLowerCase())
      );

      // PRIVACY: Only show address if client is connected with this pro
      const isConnected = connectedClientIds.has(job.clientId);

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        category: job.category,
        urgency: job.urgency,
        status: job.status,
        budget: job.budget || null,
        timeline: job.timeline || null,
        lookingFor: job.lookingFor || [],
        preferredTypes: job.preferredTypes || [],
        viewCount: job.viewCount ?? 0,
        responseCount: job.responseCount ?? 0,
        // PRIVACY: Hide address until connected
        propertyAddress: isConnected ? job.propertyAddress : null,
        propertyCity: isConnected
          ? extractCity(job.propertyAddress || job.Client?.address || "")
          : null,
        propertyPhotos: job.propertyPhotos || [],
        createdAt: job.createdAt,
        isSpecialtyMatch: isMatch,
        isConnected,
        Client: {
          id: job.Client?.id || null,
          // PRIVACY: Show name but not full details until connected
          name: job.Client?.name || "Homeowner",
          city: job.Client?.city || extractCity(job.Client?.address || "") || null,
          state: job.Client?.state || null,
          // Only show contact info if connected
          email: isConnected ? (job.Client?.email ?? null) : null,
          phone: isConnected ? (job.Client?.phone ?? null) : null,
        },
        // Legacy compat
        photos: job.propertyPhotos || [],
      };
    });

    // Sort by specialty match first, then urgency
    matchingJobs.sort((a, b) => {
      if (a.isSpecialtyMatch && !b.isSpecialtyMatch) return -1;
      if (!a.isSpecialtyMatch && b.isSpecialtyMatch) return 1;
      return 0;
    });

    return NextResponse.json({
      jobs: matchingJobs,
      meta: {
        totalJobs: matchingJobs.length,
        serviceRadius,
        companyZip: tradesCompany.zip,
        specialties: tradesCompany.specialties,
      },
    });
  } catch (error: unknown) {
    console.error("[JobBoard] Error:", error);

    if (error instanceof Object && "code" in error && error.code === "P2021") {
      return NextResponse.json({ jobs: [], message: "Job board not yet available" });
    }

    const message = error instanceof Error ? error.message : "Failed to fetch job board";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
