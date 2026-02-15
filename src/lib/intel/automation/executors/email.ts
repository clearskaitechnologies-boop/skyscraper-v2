// lib/intel/automation/executors/email.ts
/**
 * 🔥 EMAIL COMMUNICATION EXECUTOR
 * Auto-sends emails to adjusters/homeowners
 */

import { randomUUID } from "node:crypto";

import { Resend } from "resend";

import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function executeSendEmail(
  claimId: string,
  orgId: string,
  audience: "ADJUSTER" | "HOMEOWNER",
  config?: any
) {
  console.log(`[DOMINUS] Sending email to ${audience} for ${claimId}`);

  // Fetch claim
  const claim = await prisma.claims.findUnique({
    where: { id: claimId, orgId },
    include: { properties: true },
  });

  if (!claim) throw new Error("Claim not found");

  const recipientEmail = audience === "ADJUSTER" ? claim.adjusterEmail : claim.homeowner_email;

  if (!recipientEmail) {
    console.log(`[DOMINUS] No ${audience} email found - skipping`);
    return { skipped: true, reason: `No ${audience} email` };
  }

  // Build email content
  const subject =
    audience === "ADJUSTER"
      ? `Claim Update: ${claim.claimNumber}`
      : `Your Claim Documentation: ${claim.claimNumber}`;

  const text =
    audience === "ADJUSTER"
      ? `Dear ${claim.adjusterName || "Adjuster"},\n\nPlease find the updated claim documentation attached.\n\nBest regards,\nSkaiScraper Intelligence Team`
      : `Dear ${claim.insured_name || "Homeowner"},\n\nYour claim documentation has been updated.\n\nBest regards,\nYour Claims Team`;

  // Send email
  try {
    const result = await resend.emails.send({
      from: "SkaiScraper <noreply@skaiscrape.com>",
      to: recipientEmail,
      subject,
      text,
    });

    // Log activity
    await prisma.activities.create({
      data: {
        id: randomUUID(),
        orgId,
        claimId,
        userId: "dominus",
        userName: "Dominus AI",
        type: "email_sent",
        title: "Email Sent",
        description: `Dominus sent email to ${audience.toLowerCase()}: ${recipientEmail}`,
        metadata: {
          audience,
          emailId: result.data?.id,
        },
        updatedAt: new Date(),
      },
    });

    console.log(`[DOMINUS] Email sent successfully to ${recipientEmail}`);

    return {
      success: true,
      emailId: result.data?.id,
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error(`[DOMINUS] Email send failed:`, error);
    return {
      success: false,
      error: String(error),
    };
  }
}
