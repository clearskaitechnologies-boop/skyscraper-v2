// =====================================================
// UNIFIED GUARDS & ACCESS CONTROL - PHASE H3
// =====================================================
// Server-side helpers for auth, org, and claim protection
// Single source of truth for all guard logic
// =====================================================

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getOrg } from "@/lib/org/getOrg";
import prisma from "@/lib/prisma";

// =====================================================
// CORE AUTHENTICATION GUARDS (Phase H3)
// =====================================================

export interface AuthGuardResult {
  userId: string;
  user: any;
}

/**
 * Require authentication only (no org required)
 * Use for GLOBAL tools that work without org context
 */
export async function requireAuth(): Promise<AuthGuardResult> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.users.findFirst({
    where: { clerkUserId: userId },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return {
    userId,
    user,
  };
}

export interface OrgGuardResult extends AuthGuardResult {
  orgId: string;
  org: any;
  role: string;
}

/**
 * Get organization context (redirects to /onboarding if missing)
 * Uses mode: "required" - NEVER creates orgs, just redirects
 */
export async function requireOrg(): Promise<OrgGuardResult> {
  // mode: "required" will redirect to /sign-in or /onboarding as needed
  const orgResult = await getOrg({ mode: "required" });

  // If we get here, orgResult.ok is true (otherwise would have redirected)
  if (!orgResult.ok) {
    // TypeScript guard - should never happen
    throw new Error("Unexpected: getOrg(required) returned not ok without redirecting");
  }

  const org = await prisma.org.findUnique({
    where: { id: orgResult.orgId },
    select: {
      id: true,
      clerkOrgId: true,
      name: true,
      planKey: true,
      subscriptionStatus: true,
    },
  });

  if (!org) {
    // This indicates a race condition or data corruption
    console.error("[requireOrg] CRITICAL: Org from getOrg not in DB:", orgResult.orgId);
    redirect("/org-error");
  }

  const user = await prisma.users.findFirst({
    where: { clerkUserId: orgResult.userId },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      email: true,
    },
  });

  return {
    userId: orgResult.userId,
    user: user!,
    orgId: org.id,
    org,
    role: orgResult.role,
  };
}

/**
 * Redirect to `/claims` when org context isn't initialized
 * Use on complex pages to keep auth landing stable.
 */
export async function redirectIfNoOrgInitialized() {
  const ctx = await getOrg({ mode: "optional" });
  if (!ctx || ctx.ok === false) {
    redirect("/claims");
  }
}

export interface ClaimGuardResult extends OrgGuardResult {
  claimId: string;
  claim: any;
}

/**
 * Require claim access (validates claim belongs to user's org)
 * Use for CLAIM-scoped features (claim workspace, supplements, rebuttal)
 */
export async function requireClaim(claimId: string): Promise<ClaimGuardResult> {
  const orgGuard = await requireOrg();

  const claim = await prisma.claims.findFirst({
    where: {
      id: claimId,
      orgId: orgGuard.orgId,
    },
    select: {
      id: true,
      claimNumber: true,
      orgId: true,
      status: true,
      insured_name: true,
      homeownerEmail: true,
    },
  });

  if (!claim) {
    redirect("/claims"); // Claim not found or access denied
  }

  return {
    ...orgGuard,
    claimId,
    claim,
  };
}

// =====================================================
// LEGACY ORGANIZATION GUARDS (kept for compatibility)
// =====================================================

/**
 * Require organization to be active (not suspended/canceled)
 * Redirects to upgrade page if Org is suspended
 */
export async function requireOrgActive() {
  // mode: "required" redirects to /sign-in or /onboarding as needed
  const orgResult = await getOrg({ mode: "required" });

  // If we get here, orgResult.ok is true
  if (!orgResult.ok) {
    throw new Error("Unexpected: getOrg(required) returned not ok without redirecting");
  }

  const org = await prisma.org.findUnique({
    where: { id: orgResult.orgId },
    select: {
      id: true,
      subscriptionStatus: true,
      planKey: true,
    },
  });

  if (!org) {
    console.error("[requireOrgActive] CRITICAL: Org from getOrg not in DB");
    redirect("/org-error");
  }

  // Check if org is suspended or canceled
  const suspendedStatuses = ["canceled", "unpaid", "past_due"];

  if (org.subscriptionStatus && suspendedStatuses.includes(org.subscriptionStatus)) {
    redirect("/account/billing?status=suspended");
  }

  return org;
}

/**
 * Check if Org has sufficient tokens
 * Returns token info and whether the check passed
 */
export async function checkTokens(
  orgId: string,
  required: number = 1
): Promise<{
  allowed: boolean;
  current: number;
  required: number;
  deficit?: number;
}> {
  const wallet = await prisma.usage_tokens.findUnique({
    where: { orgId },
    select: { balance: true },
  });

  const current = wallet?.balance || 0;
  const allowed = current >= required;

  return {
    allowed,
    current,
    required,
    deficit: allowed ? undefined : required - current,
  };
}

/**
 * Require tokens (server action / API route guard)
 * Throws error with friendly message if insufficient
 */
export async function requireTokensGuard(required: number = 1) {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("Authentication required");
  }

  // Map Clerk orgId to internal orgId
  const org = await prisma.org.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  const tokenCheck = await checkTokens(org.id, required);

  if (!tokenCheck.allowed) {
    throw new Error(
      `Insufficient tokens. You need ${required} tokens but only have ${tokenCheck.current}. Please purchase more tokens to continue.`
    );
  }

  return org.id;
}

/**
 * Get friendly token error message for UI display
 */
export function getTokenErrorMessage(current: number, required: number): string {
  const deficit = required - current;

  if (current === 0) {
    return `You're out of tokens! Purchase more tokens to generate AI reports.`;
  }

  return `You need ${required} token${required > 1 ? "s" : ""} but only have ${current}. Purchase ${deficit} more token${deficit > 1 ? "s" : ""} to continue.`;
}

/**
 * Check if feature is enabled for Org's plan
 */
export async function checkFeatureAccess(feature: string): Promise<boolean> {
  const { orgId } = await auth();

  if (!orgId) {
    return false;
  }

  const org = await prisma.org.findUnique({
    where: { clerkOrgId: orgId },
    select: { planKey: true },
  });

  if (!org) {
    return false;
  }

  // Feature gates by plan
  const FEATURE_GATES: Record<string, string[]> = {
    ai_reports: ["solo", "business", "enterprise"],
    bulk_upload: ["business", "enterprise"],
    api_access: ["enterprise"],
    white_label: ["enterprise"],
    priority_support: ["business", "enterprise"],
    custom_branding: ["business", "enterprise"],
  };

  const allowedPlans = FEATURE_GATES[feature];
  if (!allowedPlans) {
    return false; // Unknown feature, deny by default
  }

  return allowedPlans.includes(org.planKey || "solo");
}

/**
 * Require feature access (throws if not allowed)
 */
export async function requireFeatureAccess(feature: string) {
  const allowed = await checkFeatureAccess(feature);

  if (!allowed) {
    throw new Error(
      `This feature is not available on your current plan. Please upgrade to access ${feature}.`
    );
  }
}
