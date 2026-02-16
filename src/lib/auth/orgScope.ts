/**
 * ============================================================================
 * Org-Scoped Data Access Helpers
 * ============================================================================
 *
 * Prevents cross-org data bleed by enforcing orgId on every query.
 * Returns 404 (not 403) to prevent ID enumeration.
 *
 * USAGE:
 *   const claim = await getOrgClaim(orgId, claimId);
 *   if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });
 *
 * ============================================================================
 */

import "server-only";

import prisma from "@/lib/prisma";

// ── Generic org-scope injector ─────────────────────────────────────────────

/**
 * Injects orgId into any Prisma `where` clause.
 * Use with findMany, findFirst, updateMany, deleteMany, etc.
 */
export function orgWhere<T extends Record<string, unknown>>(
  orgId: string,
  where: T
): T & { orgId: string } {
  return { ...where, orgId };
}

// ── Claim loaders ──────────────────────────────────────────────────────────

/**
 * Load a claim scoped by org. Returns null if not found or wrong org.
 */
export async function getOrgClaim(orgId: string, claimId: string) {
  return prisma.claims.findFirst({
    where: { id: claimId, orgId },
  });
}

/**
 * Load a claim or throw (for routes that should 404).
 */
export async function getOrgClaimOrThrow(orgId: string, claimId: string) {
  const claim = await getOrgClaim(orgId, claimId);
  if (!claim) throw new OrgScopeError("Claim not found");
  return claim;
}

// ── Project loaders ────────────────────────────────────────────────────────

export async function getOrgProject(orgId: string, projectId: string) {
  return prisma.projects.findFirst({
    where: { id: projectId, orgId },
  });
}

export async function getOrgProjectOrThrow(orgId: string, projectId: string) {
  const project = await getOrgProject(orgId, projectId);
  if (!project) throw new OrgScopeError("Project not found");
  return project;
}

// ── Lead loaders ───────────────────────────────────────────────────────────

export async function getOrgLead(orgId: string, leadId: string) {
  return prisma.leads.findFirst({
    where: { id: leadId, orgId },
  });
}

export async function getOrgLeadOrThrow(orgId: string, leadId: string) {
  const lead = await getOrgLead(orgId, leadId);
  if (!lead) throw new OrgScopeError("Lead not found");
  return lead;
}

// ── Document loaders ───────────────────────────────────────────────────────

export async function getOrgDocument(orgId: string, documentId: string) {
  return prisma.documents.findFirst({
    where: { id: documentId, orgId },
  });
}

// ── Report loaders ─────────────────────────────────────────────────────────

export async function getOrgReport(orgId: string, reportId: string) {
  return prisma.reports.findFirst({
    where: { id: reportId, orgId },
  });
}

export async function getOrgReportOrThrow(orgId: string, reportId: string) {
  const report = await getOrgReport(orgId, reportId);
  if (!report) throw new OrgScopeError("Report not found");
  return report;
}

// ── Error class ────────────────────────────────────────────────────────────

export class OrgScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrgScopeError";
  }
}
