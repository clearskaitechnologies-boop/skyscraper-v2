// ============================================================================
// POST /api/connect/respond - Pro accepts/declines connection
// ============================================================================

import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, validationError } from "@/lib/responses";

const respondSchema = z.object({
  connectionId: z.string(),
  accept: z.boolean(),
  message: z.string().optional(),
  coreLeadId: z.string().optional(), // Set by Core after lead creation
  coreClaimId: z.string().optional(), // Set by Core if linked to claim
});

export async function POST(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const proClerkId = auth.clerkUserId;
  if (!proClerkId) {
    return errorResponse("Missing clerkUserId in token", 400);
  }

  try {
    const body = await req.json();
    const validated = respondSchema.parse(body);

    // Get connection
    const connection = await prisma.clientProConnection.findUnique({
      where: { id: validated.connectionId },
    });

    if (!connection) {
      return errorResponse("Connection not found", 404);
    }

    if (connection.proClerkId !== proClerkId) {
      return errorResponse("Not authorized to respond to this connection", 403);
    }

    if (connection.status !== "pending") {
      return errorResponse("Connection already responded to", 400);
    }

    // Calculate response time
    const responseTimeMinutes = Math.round(
      (Date.now() - connection.createdAt.getTime()) / 1000 / 60
    );

    // Update connection
    const updated = await prisma.clientProConnection.update({
      where: { id: validated.connectionId },
      data: {
        status: validated.accept ? "accepted" : "declined",
        respondedAt: new Date(),
        responseTimeMinutes,
        coreLeadId: validated.coreLeadId,
        coreClaimId: validated.coreClaimId,
      },
    });

    // Update pro's response rate and completed jobs
    if (validated.accept) {
      const allConnections = await prisma.clientProConnection.findMany({
        where: { proClerkId },
      });

      const responded = allConnections.filter((c) => c.respondedAt !== null).length;
      const responseRate = (responded / allConnections.length) * 100;

      await prisma.tradeProfile.update({
        where: { clerkUserId: proClerkId },
        data: {
          responseRate: Math.round(responseRate),
          completedJobs: { increment: 1 },
        },
      });
    }

    return successResponse({ connection: updated }, 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationError(error.errors.map((e) => e.message).join(", "));
    }
    console.error("[Connect Respond] Error:", error);
    return errorResponse("Failed to respond to connection", 500);
  }
}
