// src/app/(app)/dashboard/_components/DashboardAIPanel.tsx
import { DashboardAIAssistant } from "@/components/ai/DashboardAIAssistant";
import prisma from "@/lib/prisma";

interface DashboardAIPanelProps {
  orgId: string;
}

export default async function DashboardAIPanel({ orgId }: DashboardAIPanelProps) {
  // Fetch available claims for this org
  const claims = await prisma.claims.findMany({
    where: { orgId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      claimNumber: true,
      title: true,
      properties: {
        select: {
          street: true,
          city: true,
          state: true,
          zipCode: true,
          contacts: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Transform to match the interface
  const formattedClaims = claims.map((claim) => {
    // Derive insured name from first contact (contacts is an array)
    const contact = claim.properties?.contacts?.[0];
    const insured_name = contact
      ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
      : claim.title || "Unknown";

    return {
      id: claim.id,
      claimNumber: claim.claimNumber,
      insured_name,
      propertyAddress: claim.properties
        ? [
            claim.properties.street,
            claim.properties.city,
            claim.properties.state,
            claim.properties.zipCode,
          ]
            .filter(Boolean)
            .join(", ")
        : undefined,
    };
  });

  return <DashboardAIAssistant claims={formattedClaims} orgId={orgId} />;
}
