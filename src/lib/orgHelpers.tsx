/**
 * Organization Context Helpers
 * Simplified utilities for requiring org context in pages
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export interface OrgContextResult {
  userId: string;
  orgId: string | null;
}

/**
 * Require authenticated user, return userId and orgId (may be null)
 * Use this when you need at minimum an authenticated user
 */
export async function requireAuth(): Promise<OrgContextResult> {
  const authResult = auth();
  const userId = authResult.userId;

  if (!userId) {
    redirect("/sign-in");
  }

  // Try to get orgId from auth
  const orgId = authResult.orgId ?? null;

  return {
    userId,
    orgId,
  };
}

/**
 * Require authenticated user with organization membership
 * Use this when the page MUST have an organization context
 *
 * @param fallbackRedirect - Where to redirect if no org (default: /onboarding/start)
 */
export async function requireOrg_DEPRECATED(
  fallbackRedirect = "/onboarding/start"
): Promise<{ userId: string; orgId: string }> {
  const { userId, orgId } = await requireAuth();

  if (!orgId) {
    redirect(fallbackRedirect);
  }

  return {
    userId,
    orgId,
  };
}

/**
 * Component to render when organization is required but missing
 */
export function OrganizationSetupRequired({
  title = "Organization Setup Required",
  message = "Complete your organization setup to access this feature.",
  actionLink = "/onboarding/start",
  actionLabel = "Complete Setup",
}: {
  title?: string;
  message?: string;
  actionLink?: string;
  actionLabel?: string;
}) {
  return (
    <div className="p-6">
      <div className="bg-surface-card max-w-lg space-y-4 rounded-2xl border border-border p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="flex gap-3">
          <a
            href={actionLink}
            className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {actionLabel}
          </a>
          <a
            href="/dashboard"
            className="hover:bg-surface rounded-lg border border-border px-4 py-2 text-foreground transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
