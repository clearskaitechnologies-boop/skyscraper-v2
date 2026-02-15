/**
 * GET /api/vendors/pricing
 * Get real-time pricing from vendor APIs
 */

import { NextRequest, NextResponse } from "next/server";

import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import {
  checkVendorInventory,
  getSupportedVendors,
  getVendorPricing,
} from "@/lib/vendors/vendorApiIntegration";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ctx = await getActiveOrgContext();
    if (!ctx.ok) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendor = searchParams.get("vendor");
    const skus = searchParams.get("skus")?.split(",").filter(Boolean) || [];
    const zipCode = searchParams.get("zipCode") || "";
    const action = searchParams.get("action") || "pricing";

    // List supported vendors
    if (action === "vendors") {
      return NextResponse.json({
        success: true,
        vendors: getSupportedVendors(),
      });
    }

    if (!vendor) {
      return NextResponse.json({ error: "vendor parameter required" }, { status: 400 });
    }

    if (skus.length === 0) {
      return NextResponse.json({ error: "skus parameter required" }, { status: 400 });
    }

    // Get pricing
    if (action === "pricing") {
      const pricing = await getVendorPricing(vendor, skus);
      return NextResponse.json({
        success: true,
        vendor,
        pricing,
      });
    }

    // Check inventory
    if (action === "inventory") {
      if (!zipCode) {
        return NextResponse.json(
          { error: "zipCode required for inventory check" },
          { status: 400 }
        );
      }
      const inventory = await checkVendorInventory(vendor, skus, zipCode);
      return NextResponse.json({
        success: true,
        vendor,
        zipCode,
        inventory,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Vendor pricing error:", error);
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 });
  }
}
