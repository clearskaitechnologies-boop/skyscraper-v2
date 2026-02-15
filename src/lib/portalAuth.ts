import prisma from "@/lib/prisma";

/**
 * Grant portal access to an email for a claim.
 * The actual schema uses email-based access tied to Clerk authentication.
 */
export async function grantPortalAccess(email: string, claimId: string) {
  // Check if access already exists
  const existing = await prisma.client_access.findFirst({
    where: { email, claimId },
  });

  if (existing) return existing;

  // Create new access record
  const record = await prisma.client_access.create({
    data: { id: crypto.randomUUID(), claimId, email },
  });
  return record;
}

/**
 * Validate that an email has access to a claim.
 * Uses Clerk for actual authentication - this just checks the access table.
 */
export async function validatePortalAccess(email: string, claimId: string) {
  const record = await prisma.client_access.findFirst({
    where: { email, claimId },
  });

  if (!record) return null;

  return {
    id: record.id,
    email: record.email,
    claimId: record.claimId,
  };
}

/**
 * Legacy alias for validatePortalAccess - accepts token but validates via email.
 * @deprecated Use validatePortalAccess with email instead
 */
export async function validatePortalToken(token: string, claimId?: string) {
  // If claimId is provided, use the email validation
  if (claimId) {
    return validatePortalAccess(token, claimId);
  }

  // If only token is provided, treat it as a direct claimId lookup
  // and return basic claim access info for the legacy portal
  const claim = await prisma.claims.findUnique({
    where: { id: token },
    select: { id: true, orgId: true },
  });

  if (!claim) return null;

  return {
    id: token,
    email: null,
    claimId: claim.id,
    orgId: claim.orgId,
  };
}

/**
 * Legacy alias for grantPortalAccess - generates "token" which is really email-based access.
 * @deprecated Use grantPortalAccess with email instead
 */
export async function generatePortalToken(email: string, claimId: string) {
  const record = await grantPortalAccess(email, claimId);
  // Return a "token" that's really just the email for backwards compatibility
  return { token: email, id: record.id };
}
