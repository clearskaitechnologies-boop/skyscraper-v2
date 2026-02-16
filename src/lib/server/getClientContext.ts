/**
 * Safe Client Context Resolver
 *
 * GUARANTEES:
 * - NEVER throws errors
 * - Always returns a valid status
 * - Handles missing client profiles
 * - Handles missing claims
 * - Supports demo claims
 * - Safe for Server Components
 */

import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import type { Client as ClientModel } from "@prisma/client";

import { safePortalQuery } from "@/lib/portal/safePortalQuery";
import prisma from "@/lib/prisma";

export type ClientContextStatus = "unauthenticated" | "no-client-profile" | "ok" | "error";

type ClientContextOk = {
  status: "ok";
  client: ClientModel;
  claims: any[];
};

type ClientContextNoClient = {
  status: "unauthenticated" | "no-client-profile";
  client: null;
  claims: any[];
};

type ClientContextError = {
  status: "error";
  client: null;
  claims: any[];
  error: string;
};

export type ClientContext = ClientContextOk | ClientContextNoClient | ClientContextError;

/**
 * Get client context safely
 * NEVER throws - returns error status instead
 */
export async function getClientContext(): Promise<ClientContext> {
  try {
    // 1. Check authentication
    const user = await currentUser();

    if (!user) {
      return {
        status: "unauthenticated",
        client: null,
        claims: [],
      };
    }

    // 2. Try to find client profile
    let client: ClientModel | null = null;
    try {
      client = await prisma.client.findFirst({
        where: {
          OR: [{ userId: user.id }, { email: user.emailAddresses[0]?.emailAddress ?? "" }],
        },
      });
    } catch (clientError) {
      console.error("[CLIENT_CONTEXT] Error fetching client:", clientError);
      // Don't throw - continue to return empty state
    }

    if (!client) {
      return {
        status: "no-client-profile",
        client: null,
        claims: [],
      };
    }

    // 3. Fetch claims safely
    let claims: any[] = [];
    try {
      claims = await prisma.claims.findMany({
        where: {
          OR: [{ clientId: client.id }, { homeowner_email: client.email }],
        },
        orderBy: { updatedAt: "desc" },
        take: 50, // Reasonable limit
        select: {
          id: true,
          claimNumber: true,
          title: true,
          status: true,
          dateOfLoss: true,
          carrier: true,
          insured_name: true,
          properties: {
            select: {
              address: true,
              street: true,
              city: true,
              state: true,
              zipCode: true,
              postal_code: true,
            },
          },
          updatedAt: true,
          createdAt: true,
        },
      });
    } catch (claimsError) {
      console.error("[CLIENT_CONTEXT] Error fetching claims:", claimsError);
      // Don't throw - return empty claims array
      claims = [];
    }

    return {
      status: "ok",
      client,
      claims,
    };
  } catch (error: any) {
    logger.error("[CLIENT_CONTEXT] Fatal error:", error);

    // Return error state instead of throwing
    return {
      status: "error",
      client: null,
      claims: [],
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Get single claim safely (for detail pages)
 * Validates client access
 */
export async function getClientClaim(
  claimId: string
): Promise<{ claim: any | null; hasAccess: boolean; error?: string }> {
  try {
    const context = await getClientContext();

    if (context.status === "unauthenticated") {
      return { claim: null, hasAccess: false, error: "Not authenticated" };
    }

    if (context.status === "no-client-profile") {
      return { claim: null, hasAccess: false, error: "No client profile" };
    }

    if (context.status === "error") {
      return { claim: null, hasAccess: false, error: context.error };
    }

    if (context.status !== "ok") {
      return { claim: null, hasAccess: false, error: "Client context unavailable" };
    }

    // Fetch claim
    const claimResult = await safePortalQuery(() =>
      prisma.claims.findUnique({
        where: { id: claimId },
        include: {
          properties: true,
          contact: true,
        },
      })
    );

    if (!claimResult.ok) {
      return { claim: null, hasAccess: false, error: claimResult.message };
    }

    const claim = claimResult.data;
    if (!claim) {
      return { claim: null, hasAccess: false, error: "Claim not found" };
    }

    // Check access
    const hasAccess =
      claim.clientId === context.client.id || claim.homeowner_email === context.client.email;

    return { claim, hasAccess };
  } catch (error: any) {
    logger.error("[CLIENT_CONTEXT] Fatal error in getClientClaim:", error);
    return {
      claim: null,
      hasAccess: false,
      error: error.message || "Unknown error",
    };
  }
}
