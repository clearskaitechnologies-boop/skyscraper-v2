import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * Template sections are stored as JSON in report_templates (section_order, section_enabled).
 * Individual section editing is not yet implemented.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string; sectionId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, sectionId } = await params;
    logger.debug(`[TemplateSections] PATCH stub for template ${templateId} section ${sectionId}`);

    // Sections are stored as JSON in report_templates.section_order / section_enabled
    // Individual section editing would require JSON manipulation
    return NextResponse.json({
      message: "Section editing stored in template JSON. Use template PATCH endpoint.",
      templateId,
      sectionId,
    });
  } catch (error) {
    logger.error("Failed to update section:", error);
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ templateId: string; sectionId: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, sectionId } = await params;
    logger.debug(`[TemplateSections] DELETE stub for template ${templateId} section ${sectionId}`);

    return NextResponse.json({
      message: "Section deletion stored in template JSON. Use template PATCH endpoint.",
      templateId,
      sectionId,
    });
  } catch (error) {
    logger.error("Failed to delete section:", error);
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
