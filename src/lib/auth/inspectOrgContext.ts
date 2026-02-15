/**
 * 🔍 UNIVERSAL ORG CONTEXT INSPECTOR
 *
 * Detects ANY corruption or mismatch in user/org state immediately.
 * Returns diagnostic report with recommended actions.
 *
 * USE THIS ON EVERY REQUEST to catch issues before they break the app.
 */

import { currentUser } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export type OrgContextStatus =
  | "healthy"
  | "no-clerk-user"
  | "db-user-missing"
  | "no-org"
  | "multiple-orgs"
  | "org-missing"
  | "membership-broken";

export interface OrgContextReport {
  status: OrgContextStatus;
  userId?: string;
  email?: string;
  orgId?: string;
  orgIds?: string[];
  action?: string;
  message?: string;
  recommendedAction?: string;
  details?: any;
}

/**
 * Inspect the org context for the current user
 * Returns a diagnostic report with status and recommended action
 */
export async function inspectOrgContext(): Promise<OrgContextReport> {
  // 1. Check Clerk user exists
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return {
      status: "no-clerk-user",
      action: "redirect-to-signin",
      message: "No signed-in Clerk user detected.",
      recommendedAction: "redirect-to-signin",
    };
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  const clerkUserId = clerkUser.id;

  if (!email) {
    return {
      status: "no-clerk-user",
      action: "invalid-clerk-user",
      message: "Clerk user is missing an email address.",
      recommendedAction: "invalid-clerk-user",
      details: "No email found in Clerk user",
    };
  }

  // 2. Check if user exists in database
  const dbUser = await prisma.users.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      email: true,
      orgId: true,
    },
  });

  if (!dbUser) {
    return {
      status: "db-user-missing",
      action: "create-user-record",
      email,
      userId: clerkUserId,
      message: "No matching user record found in the database.",
      recommendedAction: "create-user-record",
    };
  }

  // 3. Check user_organizations memberships
  const memberships = await prisma.user_organizations.findMany({
    where: { userId: clerkUserId },
    include: {
      organization: true,
    },
  });

  // 4. No memberships at all
  if (memberships.length === 0) {
    // Check legacy orgId field in users table
    if (dbUser.orgId) {
      // User has legacy orgId but no membership
      return {
        status: "membership-broken",
        action: "migrate-legacy-org",
        userId: dbUser.id,
        orgId: dbUser.orgId,
        email: dbUser.email,
        message: "User has a legacy orgId but no org membership record.",
        recommendedAction: "migrate-legacy-org",
      };
    }

    return {
      status: "no-org",
      action: "create-new-org",
      userId: dbUser.id,
      email: dbUser.email,
      message: "No organization membership found for this user.",
      recommendedAction: "create-new-org",
    };
  }

  // 5. Multiple memberships (duplicates!)
  if (memberships.length > 1) {
    return {
      status: "multiple-orgs",
      action: "cleanup-duplicates",
      userId: dbUser.id,
      orgIds: memberships.map((m) => m.orgId).filter((id): id is string => id !== null),
      details: `User has ${memberships.length} org memberships`,
      message: "Multiple organization memberships detected.",
      recommendedAction: "cleanup-duplicates",
    };
  }

  // 6. Single membership - check if org exists
  const membership = memberships[0];
  if (!membership.organization) {
    return {
      status: "org-missing",
      action: "cleanup-orphaned-membership",
      userId: dbUser.id,
      orgId: membership.organizationId || undefined,
      details: "Membership points to non-existent org",
      message: "Membership points to a missing organization record.",
      recommendedAction: "cleanup-orphaned-membership",
    };
  }

  // 7. Everything is healthy! ✅
  return {
    status: "healthy",
    userId: dbUser.id,
    email: dbUser.email,
    orgId: membership.organizationId || undefined,
    message: "Org context is healthy.",
    details: {
      orgName: membership.organization.name,
      membershipRole: membership.role,
      orgArchived: membership.organization.isArchived,
    },
  };
}

/**
 * Quick check: does user have a valid org?
 * Returns orgId or null
 */
export async function getHealthyOrgId(): Promise<string | null> {
  const report = await inspectOrgContext();
  if (report.status === "healthy" && report.orgId) {
    return report.orgId;
  }
  return null;
}

/**
 * Log the current org context status (for debugging)
 */
export async function logOrgContext(prefix = "[OrgContext]") {
  const report = await inspectOrgContext();

  if (report.status === "healthy") {
    console.log(`${prefix} ✅ Healthy:`, {
      userId: report.userId,
      orgId: report.orgId,
      email: report.email,
    });
  } else {
    console.warn(`${prefix} ⚠️ ${report.status}:`, report);
  }

  return report;
}
