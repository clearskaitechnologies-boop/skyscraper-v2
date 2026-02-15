/**
 * Auto-onboarding route
 * Creates org + membership for signed-in users, then redirects to dashboard
 */

import { NextResponse } from "next/server";

import { ensureActiveOrgForUser } from "@/lib/auth/ensureOrg";

// 🔥 FORCE NODE RUNTIME - USES PRISMA
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const result = await ensureActiveOrgForUser();

  // If signed out, send to sign-in
  if (!result.ok && result.reason === "SIGNED_OUT") {
    const url = new URL(req.url);
    return NextResponse.redirect(
      new URL(`/sign-in?redirect_url=${encodeURIComponent(url.origin + "/dashboard")}`, url.origin)
    );
  }

  // If user creation failed, send to error page
  if (!result.ok) {
    return NextResponse.redirect(new URL("/error?reason=onboarding_failed", req.url));
  }

  // Success - redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
