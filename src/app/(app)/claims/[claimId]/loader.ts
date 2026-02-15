// src/app/(app)/claims/[claimId]/loader.ts
import { getClaimDetailsByParam } from "@/lib/claims/getClaimByParam";
import { getOrg } from "@/lib/org/getOrg";
import prisma from "@/lib/prisma";

export type ClaimDetails = NonNullable<Awaited<ReturnType<typeof getClaimDetailsByParam>>>;

export type GetClaimResult =
  | { ok: true; claim: ClaimDetails }
  | { ok: false; reason: "UNAUTHENTICATED" | "NO_ORG" | "NOT_FOUND" | "DB_ERROR"; detail?: string };

/**
 * SAFE getClaim - NEVER throws, always returns a result object.
 *
 * Uses getOrg({ mode: "optional" }) - NEVER creates orgs during render.
 * Caller (layout) decides how to handle NO_ORG.
 *
 * @param claimId - The claim ID to fetch
 * @param orgId - Optional orgId to use (for API routes), otherwise resolves from auth
 */
export async function getClaim(claimId: string, orgId?: string): Promise<GetClaimResult> {
  try {
    console.log(`🔥🔥🔥 [getClaim] === START === claimId: ${claimId}`);

    // PUBLIC DEMO ALIAS: Return synthetic claim without org context
    if (claimId === "test") {
      const now = new Date();
      return {
        ok: true,
        claim: {
          id: "test",
          orgId: "demo-org",
          claimNumber: "CLM-DEMO-001",
          status: "active",
          title: "John Smith — Demo Claim",
          description: "Demo claim for workspace preview",
          insured_name: "John Smith",
          homeownerEmail: "john.smith@example.com",
          carrier: "Demo Carrier",
          policyNumber: null,
          adjusterName: "Alex Adjuster",
          adjusterEmail: "alex.adjuster@example.com",
          adjusterPhone: "(555) 010-2000",
          damageType: "STORM",
          dateOfLoss: new Date("2025-12-01"),
          lifecycle_stage: "FILED",
          createdAt: now,
          updatedAt: now,
          propertyId: null,
          priority: null,
          estimatedValue: 0,
          approvedValue: 0,
          deductible: 0,
          assignedTo: null,
          coverPhotoUrl: null,
          coverPhotoId: null,
          property: { address: "123 Demo St, Phoenix, AZ 85001" },
          contact: null,
        },
      } as unknown as GetClaimResult;
    }

    // Resolve org ID using OPTIONAL mode (NEVER creates, NEVER redirects)
    const resolvedOrgId =
      orgId ??
      (await (async () => {
        const res = await getOrg({ mode: "optional" });
        if (!res.ok) {
          console.error(`🔥 [getClaim] Org resolution failed: ${res.reason}`);
          return null;
        }
        return res.orgId;
      })());

    if (!resolvedOrgId) {
      console.error(`🔥🔥🔥 [getClaim] NO_ORG: Cannot fetch claim without org context`);
      return { ok: false, reason: "NO_ORG" };
    }

    console.log(`🔥 [getClaim] Got orgId: ${resolvedOrgId}, fetching claim...`);

    // ✅ CRITICAL FIX: Use resolver that accepts id OR claimNumber
    const claim = await getClaimDetailsByParam(resolvedOrgId, claimId);

    if (!claim) {
      console.error(`🔥🔥🔥 [getClaim] CLAIM NOT FOUND: ${claimId} for orgId ${resolvedOrgId}`);
      const availableClaims = await prisma.claims.findMany({
        where: { orgId: resolvedOrgId },
        select: { id: true, claimNumber: true, title: true },
        take: 10,
      });
      console.log(`🔥 [getClaim] Available claims (${availableClaims.length}):`, availableClaims);
      return { ok: false, reason: "NOT_FOUND" };
    }

    console.log(`🔥 [getClaim] SUCCESS ✅ - Found claim #${claim.claimNumber}`);
    return { ok: true, claim };
  } catch (error: any) {
    console.error("🔥🔥🔥 [getClaim] DB_ERROR:", error);
    console.error("🔥 [getClaim] Stack:", error.stack);
    return {
      ok: false,
      reason: "DB_ERROR",
      detail: error?.message ?? String(error),
    };
  }
}
