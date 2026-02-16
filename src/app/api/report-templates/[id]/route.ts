// app/api/report-templates/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Verify template belongs to Org
    const template = await prisma.report_templates.findUnique({
      where: { id },
      select: { org_id: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.org_id !== orgId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete template
    await prisma.report_templates
      .delete({
        where: { id },
      })
      .catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error("DELETE /api/report-templates/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}
