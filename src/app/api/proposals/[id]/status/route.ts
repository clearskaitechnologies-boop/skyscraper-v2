import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposalId = params.id;

    // Fetch proposal with all details
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        organization_id,
        project_name,
        property_address,
        claim_id,
        loss_type,
        template_id,
        notes,
        status,
        generated_content,
        error_message,
        tokens_used,
        created_by,
        created_at,
        updated_at
      FROM proposals
      WHERE id = ${proposalId} AND organization_id = ${orgId}
      LIMIT 1
      `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const proposal = result[0];

    return NextResponse.json({
      id: proposal.id,
      project_name: proposal.project_name,
      property_address: proposal.property_address,
      claim_id: proposal.claim_id,
      loss_type: proposal.loss_type,
      template_id: proposal.template_id,
      notes: proposal.notes,
      status: proposal.status,
      generated_content: proposal.generated_content,
      error_message: proposal.error_message,
      tokens_used: proposal.tokens_used,
      created_at: proposal.created_at,
      updated_at: proposal.updated_at,
    });
  } catch (error) {
    logger.error("[Proposals] Error fetching status:", error);
    return NextResponse.json({ error: "Failed to fetch proposal status" }, { status: 500 });
  }
}
