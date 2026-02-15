/**
 * VIN — Programs API (rebates, financing, certifications)
 * GET /api/vin/programs — Browse all active programs
 */

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programType = searchParams.get("type");
    const tradeType = searchParams.get("trade");

    const where: Record<string, unknown> = { isActive: true };
    if (programType) where.programType = programType;

    const programs = await prisma.vendor_programs.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        Vendor: {
          select: { id: true, name: true, slug: true, logo: true, tradeTypes: true },
        },
      },
    });

    // Filter by trade if specified
    let filtered = programs;
    if (tradeType) {
      filtered = programs.filter((p) => p.Vendor.tradeTypes.includes(tradeType));
    }

    return NextResponse.json({
      success: true,
      programs: filtered.map((p) => ({
        id: p.id,
        programType: p.programType,
        name: p.name,
        description: p.description,
        eligibility: p.eligibility,
        amount: p.amount ? Number(p.amount) : null,
        percentOff: p.percentOff ? Number(p.percentOff) : null,
        validFrom: p.validFrom,
        validTo: p.validTo,
        applicationUrl: p.applicationUrl,
        terms: p.terms,
        vendor: p.Vendor,
      })),
    });
  } catch (error) {
    console.error("[VIN Programs] Error:", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}
