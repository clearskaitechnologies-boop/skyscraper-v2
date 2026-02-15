/**
 * Job Documents API - Manage project documents
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { getClientFromAuth } from "@/lib/portal/getClientFromAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = params;

    const client = await getClientFromAuth();
    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const job = await prisma.clientWorkRequest.findFirst({
      where: { id: jobId, clientId: client.id },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const documents = await prisma.clientJobDocument.findMany({
      where: { jobId, type: "document", clientId: client.id },
      orderBy: { createdAt: "desc" },
    });

    const payload = documents.map((doc) => ({
      id: doc.id,
      name: doc.title,
      type: doc.mimeType || "document",
      size: doc.sizeBytes || 0,
      url: doc.url,
      uploadedAt: doc.createdAt.toISOString(),
      uploadedBy: doc.uploadedBy || "client",
    }));

    return NextResponse.json({ documents: payload });
  } catch (error) {
    console.error("[Job Documents] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
