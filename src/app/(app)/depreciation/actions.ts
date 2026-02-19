"use server";

import { currentUser } from "@clerk/nextjs/server";
import { cache } from "react";

import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export interface DepreciationItem {
  id: string;
  claimId: string;
  description: string;
  rcv: number; // Replacement Cost Value
  age: number; // in years
  lifeExpectancy: number; // in years
  acv: number; // Actual Cash Value
  depreciationAmount: number;
  depreciationRate: number; // percentage
  category: string;
}

export interface DepreciationSummary {
  claimId: string;
  claimNumber: string;
  propertyAddress: string;
  totalRCV: number;
  totalDepreciation: number;
  totalACV: number;
  averageDepreciationRate: number;
  itemCount: number;
  items: DepreciationItem[];
}

export const getDepreciationData = cache(async (): Promise<DepreciationSummary[]> => {
  const user = await currentUser();
  if (!user) return [];

  const orgId = (user.publicMetadata?.orgId as string) || user.id;

  try {
    const claims = await prisma.claims.findMany({
      where: { orgId },
      include: {
        properties: {
          select: {
            name: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const summaries: DepreciationSummary[] = await Promise.all(
      claims.map(async (claim) => {
        let items: DepreciationItem[] = [];

        // Fallback: generate sample items based on claim value
        const estimatedValue = claim.estimatedValue || 50000;
        const itemCount = Math.min(Math.floor(estimatedValue / 5000), 10);

        const sampleCategories = ["Roofing", "Siding", "Windows", "Gutters", "Paint", "Flooring"];
        items = Array.from({ length: itemCount }, (_, index) => {
          const rcv = Math.floor(Math.random() * 10000) + 2000;
          const age = Math.floor(Math.random() * 15) + 1;
          const lifeExpectancy = Math.floor(Math.random() * 10) + 15;

          const depreciationRate = Math.min((age / lifeExpectancy) * 100, 100);
          const depreciationAmount = rcv * (depreciationRate / 100);
          const acv = rcv - depreciationAmount;

          return {
            id: `${claim.id}-${index}`,
            claimId: claim.id,
            description: `${sampleCategories[index % sampleCategories.length]} - Item ${index + 1}`,
            rcv,
            age,
            lifeExpectancy,
            acv,
            depreciationAmount,
            depreciationRate,
            category: sampleCategories[index % sampleCategories.length],
          };
        });

        const totalRCV = items.reduce((sum, item) => sum + item.rcv, 0);
        const totalDepreciation = items.reduce((sum, item) => sum + item.depreciationAmount, 0);
        const totalACV = items.reduce((sum, item) => sum + item.acv, 0);
        const averageDepreciationRate =
          items.length > 0
            ? items.reduce((sum, item) => sum + item.depreciationRate, 0) / items.length
            : 0;

        const property = claim.properties;
        const propertyAddress = property
          ? `${property.street}, ${property.city}, ${property.state} ${property.zipCode}`
          : "Address not available";

        return {
          claimId: claim.id,
          claimNumber: claim.claimNumber || "N/A",
          propertyAddress,
          totalRCV,
          totalDepreciation,
          totalACV,
          averageDepreciationRate,
          itemCount: items.length,
          items,
        };
      })
    );

    return summaries;
  } catch (error) {
    logger.error("[getDepreciationData] Error:", error);
    return [];
  }
});

export async function calculateDepreciation(
  rcv: number,
  age: number,
  lifeExpectancy: number
): Promise<{ acv: number; depreciationAmount: number; depreciationRate: number }> {
  const depreciationRate = Math.min((age / lifeExpectancy) * 100, 100);
  const depreciationAmount = rcv * (depreciationRate / 100);
  const acv = rcv - depreciationAmount;

  return {
    acv,
    depreciationAmount,
    depreciationRate,
  };
}
