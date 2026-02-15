import { NextRequest } from "next/server";

import { apiError, apiSuccess, apiUnauthorized, validateRequired } from "@/lib/api/safeResponse";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

/**
 * POST /api/portal/invite
 * Invite a client/homeowner to the portal by adding them to client_access
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return apiUnauthorized();
    }

    const body = await req.json();
    const validation = validateRequired(body, ["email", "claimId"]);

    if (!validation.valid) {
      return apiError("Missing required fields", JSON.stringify(validation.missing));
    }

    const { firstName, lastName, email, phone, claimId } = body;

    // Verify claim belongs to org
    const claim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { id: true, orgId: true },
    });

    if (!claim || claim.orgId !== ctx.orgId) {
      return apiError("Claim not found or unauthorized");
    }

    // Check if access already exists
    const existingAccess = await prisma.client_access.findFirst({
      where: { email, claimId },
    });

    if (existingAccess) {
      return apiSuccess({
        message: "Portal access already exists for this email",
        portalAccess: existingAccess,
        portalLink: `/client/claim/${claimId}`,
      });
    }

    // Create or update Client record for metadata
    let client = await prisma.client.findFirst({
      where: { email, orgId: ctx.orgId },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          id: crypto.randomUUID(),
          slug: `client-${crypto.randomUUID().slice(0, 8)}`,
          orgId: ctx.orgId,
          firstName: firstName || null,
          lastName: lastName || null,
          name: firstName && lastName ? `${firstName} ${lastName}` : null,
          email,
          phone: phone || null,
        },
      });
    }

    // Create client_access record (grants portal access)
    const portalAccess = await prisma.client_access.create({
      data: {
        id: crypto.randomUUID(),
        claimId,
        email,
      },
    });

    // Note: Portal invitation emails can be sent via Resend
    // See docs/DEPLOYMENT_GUIDE.md Part 5 for Resend setup

    return apiSuccess({
      client,
      portalAccess,
      portalLink: `/client/claim/${claimId}`,
    });
  } catch (error) {
    console.error("[Portal Invite Error]", error);
    return apiError(
      "Failed to create portal invite",
      error instanceof Error ? error.message : undefined
    );
  }
}
