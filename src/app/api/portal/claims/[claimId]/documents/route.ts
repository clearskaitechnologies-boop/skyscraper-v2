// Portal document upload API - allows EDITOR clients to upload documents to claims
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

import { assertPortalAccess } from "@/lib/auth/portalAccess";
import prisma from "@/lib/prisma";
import { uploadBuffer } from "@/lib/s3";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Rate limiting (in-memory, simple)
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // 5 document uploads per 10 minutes
const RATE_WINDOW = 10 * 60 * 1000;

/**
 * POST /api/portal/claims/[claimId]/documents
 * Upload document from portal (EDITOR role required)
 */
export async function POST(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId } = params;

    // Verify portal access + get access record
    let access;
    try {
      access = await assertPortalAccess({ userId, claimId });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // ⚡ REQUIRE EDITOR ROLE
    if (access.role !== "EDITOR") {
      return NextResponse.json(
        { error: "Upload permission denied: EDITOR role required" },
        { status: 403 }
      );
    }

    // Rate limiting
    const now = Date.now();
    const userKey = `${userId}:${claimId}`;
    const attempts = uploadAttempts.get(userKey);

    if (attempts) {
      if (now < attempts.resetAt) {
        if (attempts.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Try again later." },
            { status: 429 }
          );
        }
        attempts.count += 1;
      } else {
        uploadAttempts.set(userKey, { count: 1, resetAt: now + RATE_WINDOW });
      }
    } else {
      uploadAttempts.set(userKey, { count: 1, resetAt: now + RATE_WINDOW });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type (documents only)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV` },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB for documents)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size: 20MB` }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "pdf";
    const s3Key = `claims/${claimId}/portal-documents/${nanoid()}.${fileExtension}`;

    // Upload to S3
    await uploadBuffer(buffer, s3Key, file.type);

    // Create database record with PORTAL source tag
    const document = await prisma.documents.create({
      data: {
        id: nanoid(),
        claimId,
        orgId: access.orgId || null,
        type: "DOCUMENT" as any,
        title: title || file.name,
        description: description || "Document uploaded from client portal",
        storageKey: s3Key,
        publicUrl: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${s3Key}`,
        fileSize: file.size,
        mimeType: file.type,
        source: "PORTAL", // ⚡ Tag as portal upload
        createdById: userId,
        visibleToClient: true,
      } as any,
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error("[PORTAL_DOCUMENTS_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}
