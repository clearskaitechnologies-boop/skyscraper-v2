export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

interface SearchResult {
  id: string;
  title: string;
  type: "lead" | "claim" | "contact" | "project" | "report";
  subtitle?: string;
  href: string;
  metadata?: Record<string, any>;
}

/**
 * Global search endpoint - searches across leads, claims, contacts, projects, reports
 * GET /api/search/global?q=<query>
 */
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

    // Search across multiple tables in parallel
    const [leads, claims, contacts, projects] = await Promise.all([
      // Search leads
      prisma.leads.findMany({
        where: {
          orgId,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { source: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        include: {
          contacts: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),

      // Search claims
      prisma.claims.findMany({
        where: {
          orgId,
          OR: [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { claimNumber: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
            { carrier: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),

      // Search contacts
      prisma.contacts.findMany({
        where: {
          orgId,
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
            { phone: { contains: searchTerm, mode: "insensitive" } },
            { company: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),

      // Search projects
      prisma.projects.findMany({
        where: {
          orgId,
          title: { contains: searchTerm, mode: "insensitive" },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Transform results into unified format
    const results: SearchResult[] = [];

    // Add leads
    leads.forEach((lead) => {
      results.push({
        id: lead.id,
        title: lead.title,
        type: "lead",
        subtitle: lead.contacts
          ? `${lead.contacts.firstName} ${lead.contacts.lastName} - ${lead.source}`
          : lead.source,
        href: `/leads/${lead.id}`,
        metadata: {
          stage: lead.stage,
          temperature: lead.temperature,
        },
      });
    });

    // Add claims
    claims.forEach((claim) => {
      results.push({
        id: claim.id,
        title: claim.title,
        type: "claim",
        subtitle: `Claim #${claim.claimNumber} - ${claim.carrier || "Unknown carrier"}`,
        href: `/claims/${claim.id}`,
        metadata: {
          status: claim.status,
          damageType: claim.damageType,
        },
      });
    });

    // Add contacts
    contacts.forEach((contact) => {
      results.push({
        id: contact.id,
        title: `${contact.firstName} ${contact.lastName}`,
        type: "contact",
        subtitle: contact.email || contact.phone || contact.company || undefined,
        href: `/contacts/${contact.id}`,
        metadata: {
          company: contact.company,
        },
      });
    });

    // Add projects
    projects.forEach((project) => {
      results.push({
        id: project.id,
        title: project.title,
        type: "project",
        subtitle: `${project.stage} - ${project.status}`,
        href: `/jobs/${project.id}`,
        metadata: {
          status: project.status,
          stage: project.stage,
        },
      });
    });

    // Sort by relevance (exact matches first, then by date)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm;
      const bExact = b.title.toLowerCase() === searchTerm;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0; // Keep original order (already sorted by createdAt desc)
    });

    return NextResponse.json({
      results: results.slice(0, 20), // Limit to 20 total results
      query,
      totalResults: results.length,
    });
  } catch (error) {
    logger.error("Global search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
