export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/referral/link
 * Returns the user's unique referral link
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { REFERRAL } from "@/lib/referrals/config";
import { ensureOrgReferralCode } from "@/lib/referrals/utils";

export async function GET() {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const code = await ensureOrgReferralCode(orgId);
    const base = env.NEXT_PUBLIC_SITE_URL;
    const url = `${base}${REFERRAL.REF_PATH_PREFIX}/${code}`;

    return NextResponse.json({ code, url });
  } catch (error) {
    logger.error("[Referral Link Error]", error);
    return NextResponse.json({ error: "Failed to generate referral link" }, { status: 500 });
  }
}
