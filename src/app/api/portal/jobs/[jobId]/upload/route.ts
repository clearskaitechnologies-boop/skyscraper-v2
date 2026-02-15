import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getClientFromAuth } from "@/lib/portal/getClientFromAuth";
import prisma from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

// Try to use Vercel Blob if available, otherwise use Supabase
let put:
  | ((pathname: string, body: File, options: { access: string }) => Promise<{ url: string }>)
  | null = null;
try {
  const vercelBlob = require("@vercel/blob");
  put = vercelBlob.put;
} catch {
  // Vercel Blob not available or not configured
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  ...IMAGE_TYPES,
];

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await getClientFromAuth();
    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const { jobId } = params;
    const job = await prisma.clientWorkRequest.findFirst({
      where: { id: jobId, clientId: client.id },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const uploadType = (formData.get("type") as string) || "document";
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const maxSize = 15 * 1024 * 1024;
    const allowedTypes = uploadType === "photo" ? IMAGE_TYPES : DOC_TYPES;

    const created: any[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
      }

      if (file.size > maxSize) {
        return NextResponse.json({ error: "File too large. Max 15MB." }, { status: 400 });
      }

      const fileExt = file.name.split(".").pop() || "bin";
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      let uploadUrl = "";

      if (put && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const filename = `portal-jobs/${jobId}/${uniqueFilename}`;
          const blob = await put(filename, file, { access: "public" });
          uploadUrl = blob.url;
        } catch (blobError) {
          console.error("[Job Upload] Vercel Blob failed:", blobError);
        }
      }

      if (!uploadUrl && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const supabase = createSupabaseAdminClient();
          const bucket = "portal-job-uploads";
          const folder = uploadType === "photo" ? "photos" : "documents";
          const filePath = `${folder}/${jobId}/${uniqueFilename}`;

          try {
            await supabase.storage.createBucket(bucket, {
              public: true,
              fileSizeLimit: maxSize,
              allowedMimeTypes: allowedTypes,
            });
          } catch {
            // Bucket may already exist
          }

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (uploadError) {
            console.error("[Job Upload] Supabase upload failed:", uploadError);
          } else {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
            uploadUrl = urlData.publicUrl;
          }
        } catch (supaError) {
          console.error("[Job Upload] Supabase error:", supaError);
        }
      }

      if (!uploadUrl) {
        return NextResponse.json(
          { error: "Storage unavailable. Please try again later." },
          { status: 503 }
        );
      }

      const record = await prisma.clientJobDocument.create({
        data: {
          id: crypto.randomUUID(),
          jobId,
          clientId: client.id,
          type: uploadType,
          title: file.name,
          url: uploadUrl,
          mimeType: file.type,
          sizeBytes: file.size,
          uploadedBy: "client",
        },
      });

      created.push(record);
    }

    // Note: ProjectNotification requires orgId and claimId, which aren't available in job context
    // The clientJobDocument records serve as the notification mechanism

    return NextResponse.json({ success: true, items: created });
  } catch (error) {
    console.error("[Job Upload] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
