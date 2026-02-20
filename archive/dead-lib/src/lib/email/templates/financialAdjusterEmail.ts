// lib/email/templates/financialAdjusterEmail.ts
import type { OrgBranding } from "@/lib/branding/fetchBranding";

import { buildBrandedEmailHTML, buildBrandedEmailText } from "../brandedTemplate";

export function buildAdjusterFinancialEmail({
  claimNumber,
  insured_name,
  propertyAddress,
  branding,
}: {
  claimNumber?: string;
  insured_name?: string;
  propertyAddress?: string;
  branding?: OrgBranding | null;
}) {
  const companyName = branding?.companyName || "SkaiScraper";
  const subject = `Claim #${claimNumber || "UNKNOWN"} – Updated Financial Review & Supplement Packet`;

  const body = `Please find attached an updated financial audit and supplement packet for:

Claim #: ${claimNumber || "N/A"}
Insured: ${insured_name || "N/A"}
Property: ${propertyAddress || "N/A"}

This packet includes:
• Replacement Cost vs Actual Cash Value comparison
• Depreciation review and corrections
• Underpayment summary
• Key supplement items with justification
• Expected settlement range

If you have any questions or require additional documentation, please let us know.

Sincerely,
${companyName} Claims Team`;

  const html = buildBrandedEmailHTML({
    branding,
    recipientName: "Adjuster",
    subject,
    heading: "Claim Financial Review Packet",
    body,
    footerText: "Professional claims documentation powered by SkaiScraper AI.",
  });

  const text = buildBrandedEmailText({
    branding,
    recipientName: "Adjuster",
    subject,
    heading: "Claim Financial Review Packet",
    body,
    footerText: "Professional claims documentation powered by SkaiScraper AI.",
  });

  return { subject, html, text };
}
