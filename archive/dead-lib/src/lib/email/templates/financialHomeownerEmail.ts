// lib/email/templates/financialHomeownerEmail.ts
import type { OrgBranding } from "@/lib/branding/fetchBranding";

import { buildBrandedEmailHTML, buildBrandedEmailText } from "../brandedTemplate";

export function buildHomeownerFinancialEmail({
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
  const subject = `Update on Your Insurance Claim #${claimNumber || "N/A"}`;

  const body = `We've completed a detailed review of your insurance claim for:

Property: ${propertyAddress || "N/A"}
Claim #: ${claimNumber || "N/A"}

Attached is a simple summary that:
• Explains what the insurance has paid so far
• Shows what we believe is still owed
• Breaks down the main differences
• Outlines next steps in plain language

If anything is confusing, reply to this email or call us and we'll go through it with you line by line.

We're here to make sure you're treated fairly.

With respect,
${companyName}`;

  const html = buildBrandedEmailHTML({
    branding,
    recipientName: insured_name,
    subject,
    heading: "Claim Update Ready",
    body,
    footerText: "Your satisfaction and fair treatment are our top priorities.",
  });

  const text = buildBrandedEmailText({
    branding,
    recipientName: insured_name,
    subject,
    heading: "Claim Update Ready",
    body,
    footerText: "Your satisfaction and fair treatment are our top priorities.",
  });

  return { subject, html, text };
}
