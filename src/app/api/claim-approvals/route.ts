import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by Clerk ID
    const user = await prisma.users.findFirst({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { approvalId, action, signedBy } = await req.json();

    // Get client IP
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";

    // carrier_approvals uses job_id relation, update via job
    const approval = await prisma.carrier_approvals.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      return NextResponse.json({ error: "Approval not found" }, { status: 404 });
    }

    // Update the carrier_approvals record
    const updated = await prisma.carrier_approvals.update({
      where: { id: approvalId },
      data: {
        updated_at: new Date(),
        // Store approval action in line_item_set JSON
        line_item_set: {
          ...((approval.line_item_set as object) || {}),
          status: action === "approve" ? "approved" : "rejected",
          signedBy: action === "approve" ? signedBy : undefined,
          ipAddress: action === "approve" ? ipAddress : undefined,
          actionAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by Clerk ID
    const user = await prisma.users.findFirst({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ approvals: [] }, { status: 200 });
    }

    // Get approvals via crm_jobs for this user's org
    const approvals = await prisma.carrier_approvals.findMany({
      where: {
        crm_jobs: {
          org_id: user.orgId,
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ approvals });
  } catch (error) {
    console.error("Approvals fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
