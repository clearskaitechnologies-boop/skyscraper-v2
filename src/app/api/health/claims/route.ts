import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Claims Health Check Endpoint
 * Diagnoses exactly what's failing in Claims workspace
 *
 * Usage: GET /api/health/claims?claimId=xxx
 *
 * Returns JSON with pass/fail for each subsystem:
 * - auth
 * - claim access
 * - workspace data
 * - documents query
 * - artifacts query
 * - reports query
 * - upload service
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claimId = searchParams.get("claimId");

  const results: Record<string, { status: "pass" | "fail"; message?: string; error?: string }> = {};

  // 1. Auth Check
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) {
      results.auth = { status: "fail", message: "Authentication failed" };
      return NextResponse.json({ results, overall: "fail" }, { status: 401 });
    }

    const { userId, orgId } = authResult;
    results.auth = { status: "pass", message: `userId: ${userId}, orgId: ${orgId}` };

    // 2. Claim Access Check (if claimId provided)
    if (claimId) {
      const cId = claimId; // Narrow type to string
      try {
        const claim = await prisma.claims.findUnique({
          where: { id: cId },
          select: { id: true, orgId: true, claimNumber: true },
        });

        if (!claim) {
          results.claimAccess = { status: "fail", message: "Claim not found" };
        } else if (claim.orgId !== orgId) {
          results.claimAccess = { status: "fail", message: "Org mismatch" };
        } else {
          results.claimAccess = {
            status: "pass",
            message: `Claim ${claim.claimNumber} accessible`,
          };
        }
      } catch (error: any) {
        results.claimAccess = { status: "fail", error: error.message };
      }

      // 3. Documents Query Check
      try {
        const documents = await prisma.ai_reports.findMany({
          where: { claimId: cId, orgId: orgId ?? undefined },
          take: 1,
        });
        results.documentsQuery = {
          status: "pass",
          message: `${documents.length} document(s) found`,
        };
      } catch (error: any) {
        results.documentsQuery = { status: "fail", error: error.message };
      }

      // 4. Artifacts Query Check
      try {
        const artifacts = await prisma.ai_reports.findMany({
          where: { claimId: cId, orgId: orgId ?? undefined },
          take: 1,
        });
        results.artifactsQuery = {
          status: "pass",
          message: `${artifacts.length} artifact(s) found`,
        };
      } catch (error: any) {
        results.artifactsQuery = { status: "fail", error: error.message };
      }

      // 5. Reports Query Check (using ai_reports table)
      try {
        const reports = await prisma.ai_reports.findMany({
          where: { claimId: cId, orgId: orgId ?? undefined },
          orderBy: { createdAt: "desc" },
          take: 1,
        });
        results.reportsQuery = { status: "pass", message: `${reports.length} report(s) found` };
      } catch (error: any) {
        results.reportsQuery = { status: "fail", error: error.message };
      }

      // 6. Workspace Data Check
      try {
        const workspace = await prisma.claims.findUnique({
          where: { id: cId },
          select: {
            id: true,
            claimNumber: true,
            title: true,
            status: true,
            orgId: true,
            propertyId: true,
            carrier: true,
            policy_number: true,
          },
        });
        results.workspaceData = workspace
          ? { status: "pass", message: "Workspace data loaded" }
          : { status: "fail", message: "No workspace data" };
      } catch (error: any) {
        results.workspaceData = { status: "fail", error: error.message };
      }
    }

    // 7. Upload Service Check
    const uploadthingConfigured = !!(
      process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID
    );
    results.uploadService = uploadthingConfigured
      ? { status: "pass", message: "UploadThing keys configured" }
      : { status: "fail", message: "Missing UPLOADTHING_SECRET or UPLOADTHING_APP_ID" };

    // 8. Database Connection Check
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database = { status: "pass", message: "Database connected" };
    } catch (error: any) {
      results.database = { status: "fail", error: error.message };
    }

    // Determine overall status
    const anyFailures = Object.values(results).some((r) => r.status === "fail");
    const overall = anyFailures ? "degraded" : "healthy";

    return NextResponse.json({
      overall,
      results,
      timestamp: new Date().toISOString(),
      claimId: claimId || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        overall: "fail",
        error: error.message,
        results,
      },
      { status: 500 }
    );
  }
}
