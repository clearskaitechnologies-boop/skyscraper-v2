import { auth } from "@clerk/nextjs/server";
import { renderToStream } from "@react-pdf/renderer";
import { NextRequest, NextResponse } from "next/server";

import { ProposalPDFDocument } from "@/lib/pdf/proposalRenderer";
import { getOrgBranding, sanitizeFilename } from "@/lib/pdf/utils";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposalId = params.id;

    // Fetch proposal
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        organization_id,
        project_name,
        property_address,
        status,
        generated_content
      FROM proposals
      WHERE id = ${proposalId} AND organization_id = ${orgId}
      LIMIT 1
      `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const proposal = result[0];

    if (proposal.status !== "ready") {
      return NextResponse.json({ error: "Proposal is not ready for download" }, { status: 400 });
    }

    if (!proposal.generated_content) {
      return NextResponse.json({ error: "No content available" }, { status: 400 });
    }

    // Parse generated content
    const generatedReport = JSON.parse(proposal.generated_content);

    // Fetch org branding
    const branding = await getOrgBranding(prisma, orgId);

    // Generate PDF using React-PDF
    const pdfData = {
      projectName: proposal.project_name,
      propertyAddress: proposal.property_address,
      lossType: proposal.loss_type,
      generatedAt: generatedReport.generatedAt,
      sections: generatedReport.sections || [],
      totalTokensUsed: generatedReport.totalTokensUsed,
      orgName: branding.orgName,
      brandLogoUrl: branding.brandLogoUrl,
    };

    const stream = await renderToStream(<ProposalPDFDocument data={pdfData} />);
    const filename = `${sanitizeFilename(proposal.project_name)}_Proposal.pdf`;

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[Proposals] Error downloading proposal:", error);
    return NextResponse.json({ error: "Failed to download proposal" }, { status: 500 });
  }
}
