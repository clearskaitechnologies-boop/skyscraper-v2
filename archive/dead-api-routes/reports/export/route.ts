import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { getTenant } from "@/lib/auth/tenant";
import prisma from "@/lib/prisma";

// Cache for 5 minutes
export const revalidate = 300;

export async function GET(request: Request) {
  try {
    const orgId = await getTenant();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json, csv, excel
    const reportType = searchParams.get("type") || "claims"; // claims, properties, financial
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query based on report type
    let data: any[] = [];

    if (reportType === "claims") {
      data = await prisma.claims.findMany({
        where: {
          orgId,
          ...(startDate && endDate
            ? {
                createdAt: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          claimNumber: true,
          lifecycle_stage: true,
          damageType: true,
          exposure_cents: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (reportType === "properties") {
      data = await prisma.properties.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
          propertyType: true,
          createdAt: true,
        },
      });
    } else if (reportType === "financial") {
      // Financial summary
      const claims = await prisma.claims.findMany({
        where: {
          orgId,
          ...(startDate && endDate
            ? {
                createdAt: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              }
            : {}),
        },
        select: {
          id: true,
          claimNumber: true,
          lifecycle_stage: true,
          exposure_cents: true,
          createdAt: true,
        },
      });

      data = claims.map((claim) => ({
        id: claim.id,
        claimNumber: claim.claimNumber,
        stage: claim.lifecycle_stage,
        exposure: claim.exposure_cents || 0,
        month: new Date(claim.createdAt).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
      }));
    }

    // Format response based on requested format
    if (format === "csv") {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="export_${reportType}_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error("Failed to export data:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

// Convert array of objects to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}
