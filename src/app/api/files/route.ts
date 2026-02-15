export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getDelegate } from "@/lib/db/modelAliases";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Org by clerkOrgId
    const Org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
    });

    if (!Org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const claimId = searchParams.get("claimId");

    // Build where clause
    const where: any = { orgId: Org.id };
    if (leadId) where.leadId = leadId;
    if (claimId) where.claimId = claimId;

    const files = await getDelegate("FileAsset").findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Failed to fetch files:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
