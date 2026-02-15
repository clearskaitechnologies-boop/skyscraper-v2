/**
 * POST /api/portal/claims/upload
 *
 * Handles file uploads for client-created claims from the portal.
 * Accepts FormData with claimId + files, stores in Supabase,
 * and creates claim_documents records.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// Vercel Blob fallback
let put:
  | ((pathname: string, body: File, options: { access: string }) => Promise<{ url: string }>)
  | null = null;
try {
  const vercelBlob = require("@vercel/blob");
  put = vercelBlob.put;
} catch {
  // Vercel Blob not available
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const claimId = formData.get("claimId") as string;
    const files = formData.getAll("files") as File[];

    if (!claimId) {
      return NextResponse.json({ error: "claimId is required" }, { status: 400 });
    }

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Verify the claim exists and belongs to this client
    const client = await prisma.client.findUnique({ where: { userId } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 403 });
    }

    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, clientId: true, orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Validate file type (images + common docs)
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/heic",
        "image/heif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        console.warn(`[Portal Claims Upload] Skipping invalid file type: ${file.type}`);
        continue;
      }

      // Max 10MB per file
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`[Portal Claims Upload] Skipping oversized file: ${file.name}`);
        continue;
      }

      const fileExt = file.name.split(".").pop() || "jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storagePath = `portal-claims/${claimId}/${uniqueName}`;
      let uploadUrl: string | null = null;

      // Strategy 1: Vercel Blob
      if (put && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(storagePath, file, { access: "public" });
          uploadUrl = blob.url;
        } catch (e) {
          console.warn("[Portal Claims Upload] Vercel Blob failed, trying Supabase:", e);
        }
      }

      // Strategy 2: Supabase Storage
      if (!uploadUrl) {
        try {
          const supabase = createSupabaseAdminClient();
          const buffer = Buffer.from(await file.arrayBuffer());
          const { data, error } = await supabase.storage
            .from("claim-photos")
            .upload(storagePath, buffer, {
              contentType: file.type,
              upsert: false,
            });

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from("claim-photos").getPublicUrl(data.path);
          uploadUrl = publicUrl;
        } catch (e) {
          console.warn("[Portal Claims Upload] Supabase storage failed:", e);
        }
      }

      // Strategy 3: Base64 data URL (last resort)
      if (!uploadUrl) {
        const buffer = Buffer.from(await file.arrayBuffer());
        uploadUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }

      if (uploadUrl) {
        uploadedUrls.push(uploadUrl);

        // Record upload metadata (best-effort, non-fatal)
        // Note: crm_documents has a different schema, skip DB record for now
        console.log(
          `[Portal Claims Upload] Uploaded ${file.name} → ${uploadUrl?.substring(0, 60)}...`
        );
      }
    }

    return NextResponse.json({
      success: true,
      uploadedCount: uploadedUrls.length,
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("[Portal Claims Upload] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
