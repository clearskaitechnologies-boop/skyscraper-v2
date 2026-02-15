import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prismaMaybeModel } from "@/lib/db/prismaModel";

// Use prismaMaybeModel since report_templates may not be in PRISMA_MODELS
const Templates = prismaMaybeModel("report_templates");

export async function POST(request: Request, { params }: { params: { templateId: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templateId = params.templateId;

    // Verify template belongs to org
    if (!Templates) {
      return NextResponse.json({ error: "Templates model unavailable" }, { status: 200 });
    }

    const template = await Templates.findFirst({
      where: {
        id: templateId,
        org_id: orgId,
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Unset current default
    await Templates.updateMany({
      where: {
        org_id: orgId,
        is_default: true,
      },
      data: {
        is_default: false,
        updated_at: new Date(),
      },
    });

    // Set new default
    const updated = await Templates.update({
      where: { id: templateId },
      data: {
        is_default: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to set default template:", error);
    return NextResponse.json({ error: "Failed to set default template" }, { status: 500 });
  }
}
