import { NextRequest, NextResponse } from "next/server";

import { getOrgIdSafe } from "@/lib/org/safeContext";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const orgId = await getOrgIdSafe();

    if (!orgId) {
      return NextResponse.json(
        { ok: false, error: "AUTH_REQUIRED", templates: [] },
        { status: 401 }
      );
    }

    const orgTemplates = await prisma.orgTemplate.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      include: {
        // We don't have a relation defined yet, so we'll fetch template separately if needed
      },
    });

    // Fetch the actual templates for each OrgTemplate
    const templatesWithDetails = await Promise.all(
      orgTemplates.map(async (orgTemplate) => {
        const template = await prisma.template.findUnique({
          where: { id: orgTemplate.templateId },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            tags: true,
            thumbnailUrl: true,
            version: true,
          },
        });

        return {
          ...orgTemplate,
          template,
          name: orgTemplate.customName || template?.name || "Untitled",
          templateJson: template?.id,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      templates: templatesWithDetails,
      count: templatesWithDetails.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
        templates: [],
      },
      { status: 500 }
    );
  }
}
