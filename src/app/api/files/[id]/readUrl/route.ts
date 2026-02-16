export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { getDelegate } from '@/lib/db/modelAliases';
import { storage } from "@/lib/firebaseAdmin";
import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

// For now, create a placeholder until Firebase is configured
async function createTempUrlFromStorageKey(storageKey: string): Promise<string> {
  try {
    // When Firebase is ready, replace with:
    const fileRef = storage.file(storageKey);
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 10, // 10 minutes
    });
    return url;
  } catch (error) {
    logger.error("Failed to generate signed URL:", error);
    // Fallback placeholder
    return "about:blank";
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
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

    const url = await createTempUrlFromStorageKey(file.storageKey);
    return NextResponse.json({ url });
  } catch (error) {
    logger.error("Failed to generate file URL:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
