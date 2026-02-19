import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId: clerkOrgId } = await auth();

    if (!userId || !clerkOrgId) {
      return NextResponse.json({ ok: false, error: "AUTH_REQUIRED" }, { status: 401 });
    }

    logger.debug("[ADD_TO_COMPANY_REQUEST]", { clerkOrgId, userId });

    // Resolve internal org ID from Clerk org ID
    const org = await prisma.org.findUnique({
      where: { clerkOrgId },
      select: { id: true },
    });

    if (!org) {
      logger.error("[ADD_TO_COMPANY_ERROR] Organization not found", { clerkOrgId });
      return NextResponse.json({ ok: false, error: "ORG_NOT_FOUND" }, { status: 404 });
    }

    const orgId = org.id;

    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ ok: false, error: "TEMPLATE_ID_REQUIRED" }, { status: 400 });
    }

    logger.debug("[ADD_TO_COMPANY_REQUEST]", { orgId, templateId });

    // Find the marketplace template
    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ ok: false, error: "TEMPLATE_NOT_FOUND" }, { status: 404 });
    }

    if (!template.isPublished) {
      return NextResponse.json({ ok: false, error: "TEMPLATE_NOT_PUBLISHED" }, { status: 403 });
    }

    // Check if already added via OrgTemplate
    const existingOrgTemplate = await prisma.orgTemplate.findUnique({
      where: {
        orgId_templateId: {
          orgId: orgId,
          templateId: template.id,
        },
      },
    });

    if (existingOrgTemplate) {
      return NextResponse.json({
        ok: true,
        orgTemplate: existingOrgTemplate,
        alreadyAdded: true,
      });
    }

    // Create OrgTemplate linking org to marketplace template
    const orgTemplate = await prisma.orgTemplate.create({
      data: {
        orgId: orgId,
        templateId: template.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    logger.debug("[ADD_TO_COMPANY_OK]", { orgTemplateId: orgTemplate.id, orgId, templateId });

    return NextResponse.json({
      ok: true,
      orgTemplateId: orgTemplate.id,
      orgTemplate,
      alreadyAdded: false,
    });
  } catch (error) {
    logger.error("Error adding template:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
