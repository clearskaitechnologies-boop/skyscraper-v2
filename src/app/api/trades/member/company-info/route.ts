/**
 * Member Company Info API
 * PATCH /api/trades/member/company-info
 *
 * Updates company info fields directly on the tradesCompanyMember record
 * No separate company entity required - simplified flow
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      memberId,
      companyName,
      companyEmail,
      companyWebsite,
      companyLicense,
      city,
      state,
      zip,
      serviceArea,
    } = body;

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Verify the member belongs to the current user
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { id: memberId },
      select: { userId: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to edit this profile" }, { status: 403 });
    }

    // Update the member with company info
    const updated = await prisma.tradesCompanyMember.update({
      where: { id: memberId },
      data: {
        companyName: companyName || null,
        companyEmail: companyEmail || null,
        companyWebsite: companyWebsite || null,
        companyLicense: companyLicense || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        serviceArea: serviceArea || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      member: updated,
    });
  } catch (error: any) {
    console.error("[PATCH /api/trades/member/company-info] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update company info" },
      { status: 500 }
    );
  }
}

// GET - Fetch current company info for a member
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      select: {
        id: true,
        companyName: true,
        companyEmail: true,
        companyWebsite: true,
        companyLicense: true,
        city: true,
        state: true,
        zip: true,
        serviceArea: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error: any) {
    console.error("[GET /api/trades/member/company-info] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch company info" },
      { status: 500 }
    );
  }
}
