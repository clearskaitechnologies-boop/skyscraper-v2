import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

// ITEM 33: Data import/export
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    const body = await req.json();
    const { format, entityType, data } = body;

    if (!format || !entityType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (format === "import") {
      // Import data from CSV/JSON
      let imported = 0;

      for (const row of data) {
        try {
          if (entityType === "leads") {
            await prisma.leads.create({
              data: {
                ...row,
                orgId,
              },
            });
            imported++;
          } else if (entityType === "clients") {
            await prisma.client.create({
              data: {
                ...row,
                orgId,
              },
            });
            imported++;
          }
        } catch (err) {
          console.error("Import row error:", err);
        }
      }

      return NextResponse.json({
        success: true,
        imported,
        total: data.length,
      });
    } else if (format === "export") {
      // Export data to CSV/JSON
      let records: any[] = [];

      if (entityType === "leads") {
        records = await prisma.leads.findMany({
          where: { orgId },
        });
      } else if (entityType === "clients") {
        records = await prisma.client.findMany({
          where: { orgId },
        });
      } else if (entityType === "claims") {
        records = await prisma.claims.findMany({
          where: { orgId },
        });
      }

      return NextResponse.json({
        success: true,
        data: records,
        count: records.length,
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Import/export error:", error);
    return NextResponse.json({ error: "Failed to import/export data" }, { status: 500 });
  }
}
