/**
 * GET /api/templates/verify-all
 * Dev-only endpoint to verify all templates have required files and data
 */

import fs from "fs/promises";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import path from "path";

import { isAuthError, requireAdmin } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  // Admin-only diagnostic endpoint
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  try {
    // Fetch all published templates
    const templates = await prisma.template.findMany({
      where: {
        isPublished: true,
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        thumbnailUrl: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Check each template
    const results = await Promise.all(
      templates.map(async (t) => {
        const slug = t.slug || "missing";
        const htmlPath = path.join(
          process.cwd(),
          "src/templates/marketplace",
          slug,
          "template.html"
        );

        let htmlExists = false;
        try {
          await fs.access(htmlPath);
          htmlExists = true;
        } catch {
          // File doesn't exist
        }

        const hasSlug = !!t.slug;
        const hasThumbnail = !!t.thumbnailUrl;
        const hasHtml = htmlExists;

        const isReady = hasSlug && hasHtml;

        return {
          id: t.id,
          slug: t.slug,
          name: t.name,
          hasSlug,
          hasThumbnail,
          hasHtml,
          htmlPath: hasHtml ? htmlPath : `❌ Missing: ${htmlPath}`,
          status: isReady ? "✅ READY" : "❌ BROKEN",
          issues: [
            !hasSlug && "Missing slug",
            !hasHtml && "Missing HTML file",
            !hasThumbnail && "Missing thumbnail",
          ].filter(Boolean),
        };
      })
    );

    const readyCount = results.filter((r) => r.status === "✅ READY").length;
    const brokenCount = results.filter((r) => r.status === "❌ BROKEN").length;

    return NextResponse.json({
      total: templates.length,
      ready: readyCount,
      broken: brokenCount,
      templates: results,
      summary: {
        message:
          readyCount === templates.length
            ? `🎉 All ${readyCount} templates are ready for generation!`
            : `⚠️  ${brokenCount} templates need fixes before demo`,
      },
    });
  } catch (error) {
    logger.error("[verify-all] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify templates" },
      { status: 500 }
    );
  }
}
