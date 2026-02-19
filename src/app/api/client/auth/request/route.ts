export const dynamic = "force-dynamic";
import { logger } from "@/lib/observability/logger";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import prisma from "@/lib/prisma";

let _resend: Resend | null = null;

function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function POST(req: Request) {
  try {
    const { email, claimId } = await req.json();

    if (!email || !claimId) {
      return NextResponse.json({ ok: false, error: "Email and claimId required" }, { status: 400 });
    }

    // Verify claim exists
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, claimNumber: true },
    });

    if (!claim) {
      return NextResponse.json({ ok: false, error: "Claim not found" }, { status: 404 });
    }

    // Create or update client access
    await prisma.client_access.upsert({
      where: {
        claimId_email: {
          claimId,
          email,
        },
      },
      create: {
        claimId,
        email,
      },
      update: {
        // Update timestamp
      },
    });

    // Generate secure login URL
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/client/${claimId}?email=${encodeURIComponent(
      email
    )}`;

    // Send magic link email
    const resendClient = getResend();
    if (!resendClient) {
      return NextResponse.json(
        { ok: false, error: "Email service not configured" },
        { status: 503 }
      );
    }

    await resendClient.emails.send({
      from: "PreLossVision <noreply@prelossvision.com>",
      to: email,
      subject: `Your Secure Claim Portal Link - ${claim.claimNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Access Your Claim Portal</h2>
          
          <p>Click the link below to securely access your claim:</p>
          
          <p style="margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Access Claim ${claim.claimNumber}
            </a>
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Or copy and paste this URL into your browser:
          </p>
          <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
            ${loginUrl}
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          
          <p style="color: #6b7280; font-size: 12px;">
            <strong>Security Note:</strong> This link provides access to your claim information. 
            Do not share this link with anyone. The link remains valid while your claim is active.
          </p>
          
          <p style="color: #9ca3af; font-size: 11px; margin-top: 30px;">
            This email was sent by PreLossVision. If you did not request access to a claim, 
            please disregard this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      description: "Access link sent successfully",
    });
  } catch (error) {
    logger.error("[CLIENT AUTH REQUEST ERROR]", error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? "Failed to send access link",
      },
      { status: 500 }
    );
  }
}
