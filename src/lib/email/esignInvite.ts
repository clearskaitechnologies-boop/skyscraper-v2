/**
 * E-Signature Invite Email System
 *
 * Send signature request emails via Resend
 */

import { logger } from "@/lib/observability/logger";
import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export interface EsignInviteData {
  to: string; // recipient email
  signerName: string;
  companyName: string;
  documentTitle: string;
  signUrl: string; // Full URL with token: /esign/sign/{envelopeId}?t=TOKEN
  expiresAt?: Date;
  propertyAddress?: string;
}

/**
 * Send signature request invitation email
 */
export async function sendEsignInvite(
  data: EsignInviteData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "sign@skaiscrape.com";

    const result = await getResend()?.emails?.send({
      from: `${data.companyName} <${fromEmail}>`,
      to: data.to,
      subject: `Please review and sign: ${data.documentTitle}`,
      html: buildEsignEmailHtml(data),
    });

    if (result.data?.id) {
      return { success: true, messageId: result.data.id };
    } else {
      return { success: false, error: "No message ID returned" };
    }
  } catch (error) {
    logger.error("[ESIGN_EMAIL_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build HTML email template for signature request
 */
function buildEsignEmailHtml(data: EsignInviteData): string {
  const expiryText = data.expiresAt
    ? `<p style="color: #6b7280; font-size: 14px;">This link expires on ${data.expiresAt.toLocaleDateString()}.</p>`
    : "";

  const propertyText = data.propertyAddress
    ? `<p style="color: #374151; margin: 16px 0;"><strong>Property:</strong> ${data.propertyAddress}</p>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">
                ${data.companyName}
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
                Hi ${data.signerName},
              </p>
              
              <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">
                <strong>${data.companyName}</strong> has requested your signature on the following document:
              </p>
              
              <p style="margin: 0 0 24px; font-size: 18px; font-weight: 600; color: #111827;">
                ${data.documentTitle}
              </p>
              
              ${propertyText}
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${data.signUrl}" style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                      Review & Sign Document
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0; font-size: 14px; color: #6b7280;">
                This link is secure and time-stamped. Your signature will be legally binding.
              </p>
              
              ${expiryText}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                This is an automated message from ${data.companyName}. If you have questions, please contact them directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send signature reminder email
 */
export async function sendEsignReminder(
  data: EsignInviteData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "sign@skaiscrape.com";

    const result = await getResend()?.emails?.send({
      from: `${data.companyName} <${fromEmail}>`,
      to: data.to,
      subject: `Reminder: Signature needed for ${data.documentTitle}`,
      html: buildReminderEmailHtml(data),
    });

    if (result.data?.id) {
      return { success: true, messageId: result.data.id };
    } else {
      return { success: false, error: "No message ID returned" };
    }
  } catch (error) {
    logger.error("[ESIGN_REMINDER_ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildReminderEmailHtml(data: EsignInviteData): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Reminder: Signature Needed</h2>
  <p>Hi ${data.signerName},</p>
  <p>This is a friendly reminder that <strong>${data.companyName}</strong> is still waiting for your signature on:</p>
  <p style="font-size: 18px; font-weight: bold;">${data.documentTitle}</p>
  <p>
    <a href="${data.signUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px;">
      Sign Now
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">This link is secure and will expire soon.</p>
</body>
</html>
  `.trim();
}
