import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};
    if (orgId) where.orgId = orgId;

    const claims = await prisma.claims.findMany({
      where,
      select: {
        id: true,
        claimNumber: true,
        insured_name: true,
        carrier: true,
        status: true,
        dateOfLoss: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      orgId: orgId || "personal",
      claims,
      meta: { totalClaims: claims.length, format: "json", version: "1.0" },
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    logger.info("Data export generated: " + claims.length + " claims");

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=\"skaiscrape-export.json\"",
      },
    });
  } catch (error) {
    logger.error("Settings export error:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
