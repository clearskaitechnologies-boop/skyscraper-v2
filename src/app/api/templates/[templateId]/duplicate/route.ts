import { auth } from "@clerk/nextjs/server";
import type { Prisma } from "@prisma/client";
import crypto from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// Use report_templates model directly
const Templates = prisma.report_templates;

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sourceId = params.id;

    // Get source template
    if (!Templates) {
      return NextResponse.json({ error: "Templates model unavailable" }, { status: 200 });
    }

    const sourceTemplate = await Templates.findFirst({
      where: {
        id: sourceId,
        org_id: orgId,
      },
    });

    if (!sourceTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Create duplicate
    const duplicate = await Templates.create({
      data: {
        id: crypto.randomUUID(),
        name: `${sourceTemplate.name} (Copy)`,
        org_id: orgId,
        is_default: false,
        section_order: sourceTemplate.section_order as unknown as Prisma.InputJsonValue,
        section_enabled: sourceTemplate.section_enabled as unknown as Prisma.InputJsonValue,
        defaults: sourceTemplate.defaults as unknown as Prisma.InputJsonValue,
        created_by: userId,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(duplicate);
  } catch (error) {
    console.error("Failed to duplicate template:", error);
    return NextResponse.json({ error: "Failed to duplicate template" }, { status: 500 });
  }
}
