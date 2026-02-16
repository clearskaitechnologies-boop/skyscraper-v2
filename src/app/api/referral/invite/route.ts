export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * POST /api/referral/invite
 * Send an email invite to a contractor
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { env } from "@/env";
import prisma from "@/lib/prisma";
import { REFERRAL } from "@/lib/referrals/config";
import { ensureOrgReferralCode, getOrgIdFromClerkOrgId } from "@/lib/referrals/utils";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "SkaiScraper <no-reply@skaiscrape.com>";

export async function POST(req: Request) {
  const { orgId: clerkOrgId } = await auth();

  if (!clerkOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = (await req.json()) as { email: string };

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const code = await ensureOrgReferralCode(clerkOrgId);
    const orgId = await getOrgIdFromClerkOrgId(clerkOrgId);

    if (!orgId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const base = env.NEXT_PUBLIC_SITE_URL;
    const url = `${base}${REFERRAL.REF_PATH_PREFIX}/${code}`;

    // Create referral record
    await prisma.referrals.create({
      data: {
        id: crypto.randomUUID(),
        org_id: orgId,
        ref_code: code,
        invited_email: email,
        status: "invited",
        updated_at: new Date(),
      },
    });

    // Send email if Resend is configured
    if (resend) {
      try {
        await resend.emails.send({
          from: FROM,
          to: [email],
          subject: "You've been invited to try SkaiScraper™",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #0F172A; font-size: 28px; font-weight: 700; margin: 0 0 12px 0;">SkaiScraper™</h1>
                <p style="color: #64748B; font-size: 16px; margin: 0;">AI-powered inspection & claims platform</p>
              </div>
              
              <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
                <h2 style="color: #0F172A; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">You've been invited!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  A contractor invited you to try SkaiScraper, the complete AI-powered inspection and claims processing platform for roofing professionals.
                </p>
                <a href="${url}" 
                   style="display: inline-block; background: #3B82F6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Join via referral link →
                </a>
              </div>
              
              <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                <p style="color: #1E40AF; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>Referral Bonus:</strong> When you subscribe to any paid plan, your inviter earns rewards!
                </p>
              </div>
              
              <div style="text-align: center; color: #94A3B8; font-size: 14px;">
                <p style="margin: 0 0 8px 0;">SkaiScraper™ - AI-Powered Operations for Trades Pros</p>
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} SkaiScraper. All rights reserved.</p>
              </div>
            </div>
          `,
          text: `
You've been invited to try SkaiScraper!

A trades professional invited you to try SkaiScraper, the AI-powered operations hub for modern tradesmen.

Join via referral link: ${url}

When you subscribe to any paid plan, your inviter earns rewards.

---
SkaiScraper™ - AI-Powered Operations for Trades Pros
© ${new Date().getFullYear()} SkaiScraper. All rights reserved.
          `,
        });
      } catch (emailError) {
        console.error("[Referral Email Error]", emailError);
        // Continue even if email fails - referral is still tracked
      }
    } else {
      logger.warn("[Referral] RESEND_API_KEY not configured - email not sent");
    }

    return NextResponse.json({ ok: true, url, emailSent: !!resend });
  } catch (error) {
    logger.error("[Referral Invite Error]", error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
