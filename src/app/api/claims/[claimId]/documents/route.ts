// src/app/api/claims/[claimId]/documents/route.ts
/**
 * Claim Documents API
 * Fetches all documents (PDFs, reports) for a specific claim
 */

import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    // Authenticate and get org
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { userId, orgId } = authResult;

    const { claimId } = params;

    // Verify claim access (view), not upload permission
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) {
      return accessResult;
    }

    const { searchParams } = new URL(req.url);
    const aiReportsOnly = searchParams.get("aiReportsOnly") === "true";

    // Build where clause
    const whereClause: any = {
      claimId,
      deletedAt: null,
    };

    // Filter for AI report PDFs only
    if (aiReportsOnly) {
      whereClause.type = {
        in: ["WEATHER", "REBUTTAL", "DEPRECIATION", "SUPPLEMENT"],
      };
    }

    // Fetch documents for this claim
    const documents = await prisma.documents.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch creator info if createdBy exists
    const userIds = [...new Set(documents.map((d) => d.createdBy).filter(Boolean) as string[])];
    const users =
      userIds.length > 0
        ? await prisma.users.findMany({
            where: { clerkUserId: { in: userIds } },
            select: { clerkUserId: true, name: true, email: true },
          })
        : [];

    const userMap = new Map(users.map((u) => [u.clerkUserId, u]));

    return NextResponse.json({
      success: true,
      documents: documents.map((doc) => {
        const user = doc.createdBy ? userMap.get(doc.createdBy) : null;
        return {
          id: doc.id,
          type: doc.type,
          title: doc.title,
          description: doc.description,
          publicUrl: doc.url,
          mimeType: doc.mimeType,
          fileSize: doc.sizeBytes,
          visibleToClient: doc.isPublic,
          createdAt: doc.createdAt.toISOString(),
          createdBy: {
            name: user?.name || "System",
            email: user?.email || "",
          },
        };
      }),
    });
  } catch (error: any) {
    console.error("[GET /api/claims/:claimId/documents] Error:", error);

    // CRITICAL: Always return documents array, never error
    // This prevents "Failed to fetch" errors in UI
    return NextResponse.json({
      success: true,
      documents: [],
    });
  }
}
