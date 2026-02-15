import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { APP_URL, features, IS_PROD, SITE_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const a = await auth();
  const cookieStore = cookies();

  const base: any = {
    ok: true,
    signedIn: Boolean(a.userId),
    app: {
      appUrl: APP_URL,
      siteUrl: SITE_URL,
      environment: IS_PROD ? "production" : "non-prod",
    },
    auth: {
      userId: a.userId || null,
      clerkOrgId: a.orgId || null,
      sessionCookiePresent: Boolean(cookieStore.get("__session")?.value),
    },
    org: {},
    storage: {},
    db: {},
    features,
  };

  // Org (optional – never redirects)
  try {
    const ctx = await getActiveOrgContext({ optional: true });
    if (ctx.ok) {
      const org = await prisma.org.findUnique({
        where: { id: ctx.orgId },
        select: { id: true, clerkOrgId: true, name: true, subscriptionStatus: true, planKey: true },
      });
      base.org = { ok: true, ...org };
    } else {
      base.org = { ok: false, reason: ctx.reason };
    }
  } catch (e: any) {
    base.org = { ok: false, error: e?.message };
  }

  // DB
  try {
    await prisma.$queryRaw`SELECT 1`;
    base.db = { ok: true };
  } catch (e: any) {
    base.db = { ok: false, error: e?.message };
  }

  // Storage (env presence only)
  base.storage = {
    supabaseUrlPresent: Boolean(SUPABASE_URL),
    supabaseAnonKeyPresent: Boolean(SUPABASE_ANON_KEY),
  };

  return NextResponse.json(base);
}
