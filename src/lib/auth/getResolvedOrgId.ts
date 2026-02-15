// src/lib/auth/getResolvedOrgId.ts
// Thin adapter around the canonical server-side org resolver.
// This exists to keep existing imports working while enforcing
// a single source of truth for org resolution.

import { getOrg } from "@/lib/org/getOrg";

/**
 * Returns the resolved DB orgId for the current authenticated user.
 *
 * - If unauthenticated, redirects to /sign-in.
 * - If no org, redirects to /onboarding.
 * - Uses getActiveOrgSafe which auto-creates orgs safely.
 */
export async function getResolvedOrgId(): Promise<string> {
  const result = await getOrg({ mode: "required" });
  // If we get here, result is guaranteed ok (otherwise would have redirected)
  if (!result.ok) {
    throw new Error("Unexpected: getOrg(required) returned not ok without redirecting");
  }
  return result.orgId;
}

/**
 * Safe version that never throws and returns null on failure.
 * This should be used only for optional org contexts (diagnostics, etc.).
 */
export async function getResolvedOrgIdSafe(): Promise<string | null> {
  const result = await getOrg({ mode: "optional" });
  return result.ok ? result.orgId : null;
}

/**
 * Returns a structured result. With mode: "required", this will
 * ALWAYS return { ok: true } because it redirects otherwise.
 */
export async function getResolvedOrgResult(): Promise<
  | { ok: true; orgId: string; userId: string }
  | { ok: false; reason: "unauthenticated" | "no-org"; userId?: string }
> {
  // Use required mode - this redirects if no org
  const result = await getOrg({ mode: "required" });

  // If we get here, result is guaranteed ok
  if (!result.ok) {
    // This should never happen with mode: "required"
    return { ok: false, reason: "no-org" };
  }

  return { ok: true, orgId: result.orgId, userId: result.userId };
}
