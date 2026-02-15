import { NextRequest, NextResponse } from "next/server";

import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

// GET specific product
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { orgId } = await getCurrentUserPermissions();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.vendorProduct.findFirst({
      where: {
        id: params.id,
        vendorId: { not: undefined }, // Product exists check
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT update product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { orgId } = await getCurrentUserPermissions();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { vendorId, name, spec, warranty, colorJson } = body;

    // Verify product exists
    const existingProduct = await prisma.vendorProduct.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = await prisma.vendorProduct.update({
      where: { id: params.id },
      data: {
        vendorId,
        name,
        spec,
        warranty,
        colorJson,
        data_sheet_url: body.specSheetUrl || body.data_sheet_url,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { orgId } = await getCurrentUserPermissions();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify product exists
    const existingProduct = await prisma.vendorProduct.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.vendorProduct.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
