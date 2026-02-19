import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { VENDORS } from "@/data/vendors";
import { createAiConfig, withAiBilling } from "@/lib/ai/withAiBilling";

export const runtime = "edge";

/**
 * GET /api/ai/product-context
 *
 * Returns all vendor product data in AI-friendly format
 * for use in pricing estimates and material recommendations.
 * Requires authentication to protect vendor data.
 */
async function GET_INNER(_req: unknown, ctx: { userId: string; orgId: string }) {
  const { userId } = ctx;
  try {
    const productContext = VENDORS.map((vendor) => ({
      vendor: vendor.name,
      slug: vendor.slug,
      categories: vendor.categories,
      phone: vendor.phone,
      website: vendor.website,
      products:
        vendor.productCatalog?.flatMap((category) =>
          category.products.map((product) => ({
            id: product.id,
            name: product.name,
            type: product.type,
            category: category.name,
            description: product.description,
            specs: product.specs,
            colors: product.colors?.map((c) => c.name),
            warranty: product.warranty,
            // For AI context
            summary: `${vendor.name} ${product.name} - ${product.type}. ${product.description || ""}. ${product.specs?.map((s) => `${s.label}: ${s.value}`).join(", ") || ""}`,
          }))
        ) || [],
    })).filter((v) => v.products.length > 0);

    return NextResponse.json({
      success: true,
      data: productContext,
      meta: {
        totalVendors: productContext.length,
        totalProducts: productContext.reduce((sum, v) => sum + v.products.length, 0),
        categories: Array.from(
          new Set(productContext.flatMap((v) => v.products.map((p) => p.category)))
        ),
      },
    });
  } catch (error) {
    logger.error("Error fetching product context:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product context" },
      { status: 500 }
    );
  }
}

export const GET = withAiBilling(
  createAiConfig("product_context", { costPerRequest: 10 }),
  GET_INNER
);
