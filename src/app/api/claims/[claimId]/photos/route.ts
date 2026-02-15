import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { uploadBuffer } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// POST /api/claims/[claimId]/photos
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    // Authenticate user and get org (for orgId in database)
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId, orgId } = authResult;

    const claimId = params.claimId;

    // Verify claim access
    const accessCheck = await verifyClaimAccess(claimId, orgId, userId);
    if (accessCheck instanceof NextResponse) {
      return accessCheck;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const caption = (formData.get("caption") as string) || "";
    const category = (formData.get("category") as string) || "damage";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "jpg";
    const s3Key = `claims/${claimId}/photos/${nanoid()}.${fileExtension}`;

    // Upload to S3
    await uploadBuffer(buffer, s3Key, file.type);

    // Create database record
    const photo = await prisma.file_assets.create({
      data: {
        id: nanoid(),
        claimId,
        orgId: orgId!,
        ownerId: userId,
        filename: file.name,
        category: category,
        note: caption || undefined,
        storageKey: s3Key,
        bucket: process.env.S3_BUCKET || "preloss",
        publicUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
        sizeBytes: file.size,
        mimeType: file.type,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: error.message || "Failed to upload photo" }, { status: 500 });
  }
}

// GET /api/claims/[claimId]/photos
export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    // Authenticate user and get org
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(params.claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    const photos = await prisma.file_assets.findMany({
      where: {
        claimId: params.claimId,
        mimeType: { startsWith: "image/" },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        filename: true,
        publicUrl: true,
        sizeBytes: true,
        mimeType: true,
        createdAt: true,
        note: true,
      },
    });

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch photos" }, { status: 500 });
  }
}
