import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserPermissions, type Permission, requirePermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/ratelimit";

// GET all products
export async function GET(req: NextRequest) {
  try {
    const { orgId, userId } = await getCurrentUserPermissions();
    if (!orgId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await requirePermission("vendors:view" as Permission);

    const identifier = getClientIdentifier(req, userId);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Get all vendor products
    const products = await prisma.vendorProduct.findMany({
      select: {
        id: true,
        vendorId: true,
        name: true,
        spec: true,
        warranty: true,
        colorJson: true,
        data_sheet_url: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
      take: 500,
    });

    return NextResponse.json({ items: products });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create new product
export async function POST(req: NextRequest) {
  try {
    const { orgId, userId } = await getCurrentUserPermissions();
    if (!orgId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await requirePermission("vendors:create" as Permission);
    const identifier = getClientIdentifier(req, userId);
    const rl = await checkRateLimit(identifier, "api");
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = await req.json();
    const {
      vendorId,
      name,
      sku,
      category,
      description,
      spec,
      warranty,
      specSheetUrl,
      colorJson,
      price,
      isActive,
    } = body;

    if (!vendorId || !name) {
      return NextResponse.json({ error: "Vendor ID and name are required" }, { status: 400 });
    }

    // Verify vendor exists
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const product = await prisma.vendorProduct.create({
      data: {
        id: crypto.randomUUID(),
        vendorId,
        name,
        spec,
        warranty,
        colorJson,
        data_sheet_url: specSheetUrl,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
