/**
 * Client Portal - Search Trades/Professionals Page
 *
 * Allows clients to search for contractors/trades in their area.
 *
 * Features:
 * - Search by service type/specialty
 * - Filter by location/radius
 * - Optional rating filter
 * - Connect button to create ClientProConnection
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prisma from "@/lib/prisma";

import { SearchTradesClient } from "./SearchTradesClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    service?: string;
    city?: string;
    state?: string;
    zip?: string;
    rating?: string;
  }>;
}

export default async function SearchTradesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;

  // 1. Check authentication
  const { userId } = await auth();

  if (!userId) {
    const returnUrl = encodeURIComponent(`/client/${slug}/search`);
    redirect(`/client/sign-in?redirect_url=${returnUrl}`);
  }

  // 2. Find the client by slug
  const client = await prisma.client.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      state: true,
      postal: true,
    },
  });

  if (!client) {
    redirect("/client/sign-in");
  }

  // Verify the client belongs to this user
  const clientByUser = await prisma.client.findFirst({
    where: { userId },
    select: { id: true, slug: true },
  });

  if (clientByUser?.slug !== slug) {
    redirect(`/client/${clientByUser?.slug}/search`);
  }

  // 3. Build search query
  const where: any = {
    isPublic: true,
    status: "approved",
  };

  // Filter by specialty/service type
  if (filters.service) {
    where.specialties = {
      has: filters.service,
    };
  }

  // Filter by location
  if (filters.city) {
    where.city = {
      contains: filters.city,
      mode: "insensitive",
    };
  }

  if (filters.state) {
    where.state = {
      equals: filters.state,
      mode: "insensitive",
    };
  }

  if (filters.zip) {
    where.zip = filters.zip;
  }

  // Filter by minimum rating
  if (filters.rating) {
    const minRating = parseFloat(filters.rating);
    if (!isNaN(minRating)) {
      where.rating = {
        gte: minRating,
      };
    }
  }

  // 4. Query trades companies
  const tradesCompanies = await prisma.tradesCompany.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      logo: true,
      description: true,
      specialties: true,
      rating: true,
      reviewCount: true,
      isVerified: true,
      city: true,
      state: true,
      zip: true,
      phone: true,
      email: true,
      website: true,
    },
    orderBy: [{ isVerified: "desc" }, { rating: "desc" }, { reviewCount: "desc" }],
    take: 50,
  });

  // 5. Get existing connections for this client
  const existingConnections = await prisma.clientProConnection.findMany({
    where: {
      clientId: client.id,
    },
    select: {
      contractorId: true,
      status: true,
    },
  });

  const connectionMap = new Map(
    existingConnections.map((conn) => [conn.contractorId, conn.status])
  );

  // 6. Get unique specialties for filter dropdown
  const allSpecialties = await prisma.tradesCompany.findMany({
    where: { isActive: true, isVerified: true },
    select: { specialties: true },
  });

  const uniqueSpecialties = [...new Set(allSpecialties.flatMap((t) => t.specialties))].sort();

  // 7. Get unique states for filter dropdown
  const allStates = await prisma.tradesCompany.findMany({
    where: { isActive: true, isVerified: true, state: { not: null } },
    select: { state: true },
    distinct: ["state"],
  });

  const uniqueStates = allStates
    .map((t) => t.state)
    .filter(Boolean)
    .sort() as string[];

  return (
    <SearchTradesClient
      clientId={client.id}
      clientSlug={client.slug}
      clientLocation={{
        city: client.city,
        state: client.state,
        postal: client.postal,
      }}
      tradesCompanies={
        tradesCompanies.map((company) => ({
          ...company,
          rating: company.rating ? Number(company.rating) : null,
          connectionStatus: connectionMap.get(company.id) || null,
        })) as any
      }
      filters={filters}
      specialties={uniqueSpecialties}
      states={uniqueStates}
    />
  );
}
