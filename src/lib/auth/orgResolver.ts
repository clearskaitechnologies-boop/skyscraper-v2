/**
 * Auto-creating org resolver that GUARANTEES org context.
 * Uses getOrg({ mode: "required" }) which redirects if no org.
 *
 * This is a thin wrapper for backward compatibility.
 */

import { getOrg } from "@/lib/org/getOrg";

export type OrgResolveResult =
  | {
      ok: true;
      orgId: string;
      userId: string;
      source: "clerk" | "membership" | "legacy" | "created";
    }
  | {
      ok: false;
      reason: "NO_USER" | "PRISMA_UNDEFINED" | "DB_ERROR";
      detail?: string;
    };

/**
 * GUARANTEED org resolver - redirects to /sign-in or /onboarding if no org.
 * If this function returns, it ALWAYS returns { ok: true }.
 */
export async function getResolvedOrgResult(): Promise<OrgResolveResult> {
  // Use required mode - this redirects if no org
  const result = await getOrg({ mode: "required" });

  // If we get here, result is guaranteed ok (otherwise would have redirected)
  if (!result.ok) {
    // This should never happen with mode: "required"
    return { ok: false, reason: "DB_ERROR", detail: "Unexpected: getOrg failed without redirect" };
  }

  return {
    ok: true,
    orgId: result.orgId,
    userId: result.userId,
    source: result.clerkOrgId ? "clerk" : "membership",
  };
}

/**
 * Custom error for missing org - use this for explicit enforcement
 */
export class NoOrgError extends Error {
  code = "NO_ORG";
  constructor(message = "User has no organization") {
    super(message);
    this.name = "NoOrgError";
  }
}

/**
 * THROWING org resolver - only use in API routes that MUST enforce org.
 * Server components should use getResolvedOrgResult() instead.
 */
export async function requireResolvedOrgId(): Promise<string> {
  const result = await getOrg({ mode: "required" });

  // If we get here, result is guaranteed ok (otherwise would have redirected)
  if (!result.ok) {
    throw new NoOrgError("Org resolution failed");
  }

  return result.orgId;
}
