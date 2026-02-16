import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { prismaMaybeModel } from "@/lib/db/prismaModel";
import prisma from "@/lib/prisma";

// Use prismaMaybeModel since report_templates may not be in PRISMA_MODELS
const Templates = prismaMaybeModel("report_templates");

export async function PATCH(request: Request, { params }: { params: { templateId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templateId = params.templateId;

    if (!Templates) {
      return NextResponse.json({ error: "Templates model unavailable" }, { status: 200 });
    }

    // Verify template belongs to org
    const template = await Templates.findFirst({
      where: {
        id: templateId,
        org_id: orgId,
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, sectionOrder, brandingConfig } = body;

    const updates: any = { updated_at: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.defaults = { ...(template.defaults || {}), description };
    if (sectionOrder !== undefined) updates.section_order = sectionOrder;
    if (brandingConfig !== undefined)
      updates.defaults = { ...(template.defaults || {}), brandingConfig };

    const updated = await Templates.update({
      where: { id: templateId },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to update template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { templateId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templateId = params.templateId;

    // Verify template exists and belongs to org
    const template = Templates
      ? await Templates.findFirst({
          where: {
            id: templateId,
            org_id: orgId,
          },
        }).catch(() => null)
      : null;

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Don't allow deleting default template
    if (template.is_default) {
      return NextResponse.json(
        { error: "Cannot delete default template. Set another template as default first." },
        { status: 400 }
      );
    }

    // Don't allow deleting system templates
    if ((template as any).templateType === "SYSTEM") {
      return NextResponse.json({ error: "Cannot delete system templates" }, { status: 400 });
    }

    // Delete related AI sections first if any exist
    await prisma.report_ai_sections
      .deleteMany({
        where: { report_id: templateId },
      })
      .catch(() => {
        // Ignore - AI sections are optional
      });

    // Delete template
    if (!Templates) {
      return NextResponse.json({ success: false, error: "Templates model unavailable" });
    }

    await Templates.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
