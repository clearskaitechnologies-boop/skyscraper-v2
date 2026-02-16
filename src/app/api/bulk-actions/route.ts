import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

// ITEM 22: Bulk actions API
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    const body = await req.json();
    const { action, entityType, ids, data } = body;

    if (!action || !entityType || !ids) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "update_status":
        if (entityType === "claims") {
          result = await prisma.claims.updateMany({
            where: { id: { in: ids }, orgId },
            data: { status: data.status },
          });
        } else if (entityType === "leads") {
          result = await prisma.leads.updateMany({
            where: { id: { in: ids }, orgId },
            data: { stage: data.stage },
          });
        } else if (entityType === "retailJobs") {
          result = await prisma.jobs.updateMany({
            where: { id: { in: ids }, orgId },
            data: { status: data.status },
          });
        }
        break;

      case "assign":
        if (entityType === "claims") {
          result = await prisma.claims.updateMany({
            where: { id: { in: ids }, orgId },
            data: { assignedTo: data.userId },
          });
        }
        break;

      case "delete":
        if (entityType === "leads") {
          result = await prisma.leads.deleteMany({
            where: { id: { in: ids }, orgId },
          });
        }
        break;

      case "archive":
        if (entityType === "claims") {
          result = await prisma.claims.updateMany({
            where: { id: { in: ids }, orgId },
            data: { status: "archived" },
          });
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      updated: result?.count || 0,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}
