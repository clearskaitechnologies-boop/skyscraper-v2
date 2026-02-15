export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getDelegate } from '@/lib/db/modelAliases';
import { storage } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const file = await getDelegate('FileAsset').findFirst({
      where: {
        id: params.id,
        orgId: Org.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate a fresh signed URL (15 minutes)
    const fileRef = storage.file(file.storageKey);
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 15, // 15 minutes
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Failed to generate file URL:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
