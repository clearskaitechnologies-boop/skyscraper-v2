import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { duplicateTemplate } from "@/lib/reports/duplicateTemplate";

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { templateId } = body;

    const newTemplate = await duplicateTemplate(templateId, orgId, {
      createdBy: userId,
    });

    return NextResponse.json(newTemplate);
  } catch (error) {
    logger.error("Duplicate template error:", error);
    return NextResponse.json({ error: "Failed to duplicate template" }, { status: 500 });
  }
}
