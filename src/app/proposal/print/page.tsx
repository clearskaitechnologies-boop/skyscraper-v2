/**
 * PHASE 3 SPRINT 3: Proposal Print Page
 * Server-side rendered page for PDF generation via Puppeteer
 * Supports 3 templates: retail/v1, claims/v1, contractor/v1
 */

import ClaimsTemplateV1 from "@/components/proposals/templates/claims/v1";
import ContractorTemplateV1 from "@/components/proposals/templates/contractor/v1";
import RetailTemplateV1 from "@/components/proposals/templates/retail/v1";
import prisma from "@/lib/prisma";
import type { AIDraftSections, ProposalContext } from "@/lib/proposals/types";

interface PrintPageProps {
  searchParams: {
    id: string;
    template: string;
    includeEvidence?: string;
    maxEvidenceImages?: string;
  };
}

export default async function ProposalPrintPage({ searchParams }: PrintPageProps) {
  const { id, template } = searchParams;

  if (!id || !template) {
    return (
      // eslint-disable-next-line react/forbid-dom-props
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Error: Missing Parameters</h1>
        <p>Required: id (proposal draft ID) and template (retail/v1 or claims/v1)</p>
      </div>
    );
  }

  // Fetch proposal draft
  const draft = await prisma.proposal_drafts.findUnique({
    where: { id },
  });

  if (!draft) {
    return (
      // eslint-disable-next-line react/forbid-dom-props
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Error: Proposal Not Found</h1>
        <p>Draft ID: {id}</p>
      </div>
    );
  }

  // Parse context and AI sections
  const context = draft.context_json as unknown as ProposalContext;
  const ai: AIDraftSections = {
    summary: draft.ai_summary || "",
    scope: draft.ai_scope || "",
    terms: draft.ai_terms || "",
    notes: draft.ai_notes || "",
  };

  // Render appropriate template
  if (template === "retail/v1") {
    return <RetailTemplateV1 ctx={context} ai={ai} />;
  } else if (template === "claims/v1") {
    return <ClaimsTemplateV1 ctx={context} ai={ai} />;
  } else if (template === "contractor/v1") {
    return <ContractorTemplateV1 ctx={context} ai={ai} />;
  } else {
    return (
      // eslint-disable-next-line react/forbid-dom-props
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Error: Invalid Template</h1>
        <p>Template: {template}</p>
        <p>Valid templates: retail/v1, claims/v1, contractor/v1</p>
      </div>
    );
  }
}
