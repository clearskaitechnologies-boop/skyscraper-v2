// lib/reports/sectionBuilders.ts

import prisma from "@/lib/prisma";

import { aiGenerateClaimSummary, aiGenerateDamageCaptions, aiGenerateRetailSummary } from "./ai";
import {
  AiSummarySectionData,
  DamageSectionData,
  DepreciationSectionData,
  EstimateSectionData,
  MaterialsSectionData,
  OcrDocData,
  ReportSectionId,
  TimelineSectionData,
  WarrantySectionData,
  WeatherSummary,
} from "./types";

export async function buildWeatherData(
  claimId: string,
  sections: ReportSectionId[]
): Promise<WeatherSummary> {
  void claimId;
  void sections;
  return {};
}

export async function buildAiDamageSection(photos: any[], claims: any): Promise<DamageSectionData> {
  const filtered = photos.filter((p) =>
    ["ROOF_DETAIL", "SOFT_METAL", "AERIAL", "FRONT_ELEVATION", "SIDING"].includes(p.type)
  );

  return {
    photos: await aiGenerateDamageCaptions(filtered, claims),
  };
}

export async function buildEstimateSection(
  claimId: string,
  sections: ReportSectionId[]
): Promise<EstimateSectionData> {
  void claimId;
  void sections;
  return {};
}

export async function buildDepreciationSection(claimId: string): Promise<DepreciationSectionData> {
  void claimId;
  return { items: [] };
}

export async function buildMaterialsSection(claimId: string): Promise<MaterialsSectionData> {
  const materials = await prisma.claimMaterial.findMany({
    where: { claimId },
  });

  if (materials.length === 0) {
    return { items: [] };
  }

  const productIds = Array.from(new Set(materials.map((m) => m.productId).filter(Boolean)));
  const products = await prisma.vendorProduct.findMany({
    where: { id: { in: productIds as string[] } },
  });

  const productById = new Map(products.map((p) => [p.id, p] as const));

  const vendorIds = Array.from(new Set(products.map((p) => p.vendorId).filter(Boolean)));
  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds as string[] } },
    select: { id: true, name: true },
  });

  const vendorById = new Map(vendors.map((v) => [v.id, v] as const));

  // Find primary material (first one as default)
  const primaryShingleMaterial = materials[0];
  const primaryShingleProduct = primaryShingleMaterial
    ? productById.get(primaryShingleMaterial.productId)
    : undefined;

  return {
    primarySystemName: primaryShingleProduct?.name,
    primaryColorName: primaryShingleMaterial?.color ?? undefined,
    items: materials.map((m) => {
      const product = productById.get(m.productId);
      const vendor = product ? vendorById.get(product.vendorId) : undefined;

      return {
        category: "General",
        name: product?.name ?? m.productId,
        vendorName: vendor?.name,
        color: m.color ?? undefined,
        quantity: m.quantity ?? undefined,
        specSheetUrl: product?.data_sheet_url ?? undefined,
      };
    }),
  };
}

export async function buildWarrantySection(
  org: any,
  optionId?: string
): Promise<WarrantySectionData> {
  void org;
  void optionId;
  return {};
}

export async function buildTimelineSection(claimId: string): Promise<TimelineSectionData> {
  void claimId;
  return {};
}

export async function buildOcrSection(claimId: string): Promise<OcrDocData[]> {
  void claimId;
  return [];
}

export async function buildAiSummaryClaim(data: any): Promise<AiSummarySectionData> {
  return await aiGenerateClaimSummary(data);
}

export async function buildAiSummaryRetail(data: any): Promise<AiSummarySectionData> {
  return await aiGenerateRetailSummary(data);
}
