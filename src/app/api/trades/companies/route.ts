/*
 * PHASE 3: Trades Companies API
 * Returns list of active trades companies
 */

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");

    const companies = await prisma.tradesCompany.findMany({
      where: {
        isActive: true,
        ...(specialty && { specialties: { has: specialty } }),
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        specialties: c.specialties || [],
        licenseNumber: c.licenseNumber,
        city: c.city,
        state: c.state,
        phone: c.phone,
        verified: c.isVerified ?? false,
        memberCount: c._count?.members ?? 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching trades companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
