export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Map Clerk orgId to internal orgId
    const Org = await prisma.org.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!Org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Fetch report
    const report = await prisma.ai_reports.findFirst({
      where: {
        id: params.id,
        orgId: Org.id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Generate new public key/token for share links
    const newPublicKey = crypto.randomUUID();
    const newClientToken = crypto.randomUUID();

    // Note: Requires publicKey and clientToken fields in ai_reports schema
    // Migration: ALTER TABLE ai_reports ADD COLUMN publicKey TEXT, ADD COLUMN clientToken TEXT;
    // Then update: await prisma.ai_reports.update({ where: { id }, data: { publicKey: newPublicKey, clientToken: newClientToken } });
    // For now, returning generated keys without database persistence

    return NextResponse.json({
      ok: true,
      publicKey: newPublicKey,
      clientToken: newClientToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reports/${report.id}/share?token=${newClientToken}`,
    });
  } catch (error) {
    console.error("Regenerate links error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to regenerate links",
      },
      { status: 500 }
    );
  }
}
