/**
 * Portal Claims Assets - Unified handler for photos, documents, artifacts
 *
 * GET /api/portal/claims/[claimId]/assets?type=photos|documents|artifacts|timeline|all
 * POST /api/portal/claims/[claimId]/assets - Upload files
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { assertPortalAccess } from "@/lib/auth/portalAccess";
import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AssetType = "photos" | "documents" | "artifacts" | "timeline" | "all";

export async function GET(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  const authResult = await requirePortalAuth();
  if (isPortalAuthError(authResult)) return authResult;
  const { userId } = authResult;

  try {
    const { claimId } = await params;
    await assertPortalAccess({ userId, claimId });

    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "all") as AssetType;

    const result: Record<string, any> = {};

    // Fetch photos
    if (type === "photos" || type === "all") {
      const photos = await prisma.photo.findMany({
        where: { claimId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          caption: true,
          category: true,
          createdAt: true,
        },
      });
      result.photos = photos;
    }

    // Fetch documents
    if (type === "documents" || type === "all") {
      const documents = await prisma.document.findMany({
        where: { claimId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          url: true,
          fileType: true,
          fileSize: true,
          category: true,
          createdAt: true,
        },
      });
      result.documents = documents;
    }

    // Fetch artifacts (generated reports, PDFs)
    if (type === "artifacts" || type === "all") {
      const artifacts = await prisma.claimArtifact.findMany({
        where: { claimId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          type: true,
          url: true,
          createdAt: true,
        },
      });
      result.artifacts = artifacts;
    }

    // Fetch timeline events
    if (type === "timeline" || type === "all") {
      const events = await prisma.claimEvent.findMany({
        where: { claimId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          eventType: true,
          createdAt: true,
          createdBy: true,
        },
      });
      result.timeline = events;
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("[Portal Claims Assets] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ claimId: string }> }) {
  const authResult = await requirePortalAuth();
  if (isPortalAuthError(authResult)) return authResult;
  const { userId } = authResult;

  try {
    const { claimId } = await params;
    await assertPortalAccess({ userId, claimId });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "document";
    const caption = (formData.get("caption") as string) || "";
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get the claim to verify org
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // For now, return a placeholder - actual upload logic would use storage service
    // In production, this would upload to S3/GCS and create the DB record
    return NextResponse.json({
      success: true,
      message: "File upload endpoint ready",
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        caption,
        assetType: type,
      },
    });
  } catch (error) {
    logger.error("[Portal Claims Assets Upload] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
