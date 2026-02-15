import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { coverPhotoUrl } = body;

    if (!coverPhotoUrl) {
      return NextResponse.json({ error: "Cover photo URL required" }, { status: 400 });
    }

    // Find the user's company membership
    const membership = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!membership?.companyId) {
      return NextResponse.json({ error: "No company found for user" }, { status: 404 });
    }

    // Update the company's cover photo (single source of truth)
    const updated = await prisma.tradesCompany.update({
      where: { id: membership.companyId },
      data: {
        coverimage: coverPhotoUrl,
        updatedAt: new Date(),
      },
    });

    // NOTE: removed dual-write to tradesCompanyMember.coverPhoto
    // Company cover photo lives only on tradesCompany.coverimage
    // Member coverPhoto is reserved for individual pro profile covers

    return NextResponse.json({
      ok: true,
      company: {
        id: updated.id,
        coverPhoto: updated.coverimage,
      },
    });
  } catch (error) {
    console.error("[trades/company/cover] Error:", error);
    return NextResponse.json({ error: "Failed to update cover photo" }, { status: 500 });
  }
}
