import { NextResponse } from "next/server";

import { validatePortalAccess } from "@/lib/portalAuth";
import prisma from "@/lib/prisma";
import { rateLimiters } from "@/lib/rate-limit";
import { uploadSupabase } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const title = form.get("title")?.toString();
    const file = form.get("file") as File | null;

    // Validation
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Validate portal access via Clerk auth
    const claimId = form.get("claimId")?.toString() || "";
    const email = form.get("email")?.toString() || "";
    const resolved = await validatePortalAccess(email, claimId);
    if (!resolved) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (50 uploads per minute per email)
    const allowed = await rateLimiters.uploads.check(50, `portal:${resolved.email}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    // File size validation (25MB for images, 50MB for documents)
    const maxSize = file.type.startsWith("image/") ? 25 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // MIME type validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Supported: JPEG, PNG, WEBP, HEIC, PDF" },
        { status: 400 }
      );
    }

    // Get claim to find projectId for document storage
    const claim = await prisma.claims.findUnique({
      where: { id: resolved.claimId },
      select: { projectId: true, orgId: true },
    });

    if (!claim || !claim.projectId) {
      return NextResponse.json({ error: "Claim project not found" }, { status: 404 });
    }

    // Upload file to Supabase Storage
    const bucket = file.type.startsWith("image/") ? "photos" : "documents";
    const folder = `claims/${resolved.claimId}/client`;

    const { url: publicUrl } = await uploadSupabase(file, bucket, folder);

    // Create document record using actual schema fields
    const record = await prisma.documents.create({
      data: {
        id: crypto.randomUUID(),
        projectId: claim.projectId,
        orgId: claim.orgId,
        createdBy: resolved.email, // Track who uploaded
        type: file.type.startsWith("image/") ? "PHOTO" : "OTHER",
        title: title || file.name,
        url: publicUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        isPublic: true, // Client uploaded, visible to them
        updatedAt: new Date(),
      },
    });

    console.log(`[portal:client:upload] Uploaded ${file.name} for client ${resolved.email}`);

    return NextResponse.json({
      ok: true,
      id: record.id,
      url: publicUrl,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (e: any) {
    console.error("[portal:client:upload] Error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
