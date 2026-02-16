import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireAuth";

/**
 * Safe Auth Debug Endpoint
 * Shows Clerk environment configuration WITHOUT exposing secrets
 *
 * Returns:
 * - present/missing status for each var
 * - redacted preview (first 6 + last 4 chars)
 * - NO full secrets exposed
 */

function redact(v?: string | null) {
  if (!v) return null;
  if (v.length <= 10) return `${v.slice(0, 2)}…${v.slice(-2)}`;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const { orgId, userId } = auth;
  const publishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? null;
  const secret = process.env.CLERK_SECRET_KEY ?? null;

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
        present: !!publishable,
        redacted: redact(publishable),
      },
      CLERK_SECRET_KEY: {
        present: !!secret,
        redacted: secret ? "present (hidden)" : null,
      },
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? null,
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? null,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? null,
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? null,
      VERCEL_ENV: process.env.VERCEL_ENV ?? null,
      NODE_ENV: process.env.NODE_ENV ?? null,
    },
    recommendations: [
      !publishable && "⚠️ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY missing",
      !secret && "⚠️ CLERK_SECRET_KEY missing",
      !process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL && "💡 Set NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in",
      !process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL && "💡 Set NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up",
      !process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL &&
        "💡 Set NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard",
    ].filter(Boolean),
  });
}
