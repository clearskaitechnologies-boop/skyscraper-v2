import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

import PropertyProfileClient from "./PropertyProfileClient";

export const dynamic = "force-dynamic";

async function getPropertyData(id: string) {
  try {
    // Try property_profiles first (detailed), fallback to properties (basic)
    const profile = await prisma.property_profiles
      .findFirst({
        where: { OR: [{ id }, { propertyId: id }] },
        include: {
          property_health_scores: { orderBy: { createdAt: "desc" }, take: 1 },
          property_digital_twins: true,
          property_inspections: { orderBy: { inspectionDate: "desc" } },
        },
      })
      .catch(() => null);

    if (profile) {
      return {
        property: profile,
        healthScore: profile.property_health_scores?.[0] || null,
        digitalTwins: profile.property_digital_twins || [],
        inspections: profile.property_inspections || [],
      };
    }

    // Fallback: look up basic properties record
    const basicProperty = await prisma.properties
      .findUnique({
        where: { id },
        include: {
          _count: { select: { claims: true, inspections: true, jobs: true } },
        },
      })
      .catch(() => null);

    if (basicProperty) {
      return {
        property: {
          ...basicProperty,
          streetAddress: basicProperty.street,
          fullAddress: `${basicProperty.street}, ${basicProperty.city}, ${basicProperty.state} ${basicProperty.zipCode}`,
        },
        healthScore: null,
        digitalTwins: [],
        inspections: [],
      };
    }

    return { property: null, healthScore: null, digitalTwins: [], inspections: [] };
  } catch (error) {
    logger.error("[Property Profile] Data fetch error:", error);
    return { property: null, healthScore: null, digitalTwins: [], inspections: [] };
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPropertyData(id);

  // Render empty state if property doesn't exist - DO NOT throw or redirect
  if (!data.property) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Link href="/property-profiles">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
        <EmptyState
          title="Property not found"
          description="This property profile may have been deleted or you don't have access to it."
          icon={<Home className="h-12 w-12 text-neutral-400" />}
        />
      </PageContainer>
    );
  }

  // Render with safe wrapper
  return (
    <PageContainer>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">Loading property data...</div>
        }
      >
        <PropertyProfileClient
          propertyId={id}
          initialProperty={data.property}
          initialHealthScore={data.healthScore}
          initialDigitalTwins={data.digitalTwins}
          initialInspections={data.inspections}
        />
      </Suspense>
    </PageContainer>
  );
}
