// ============================================================================
// POST /api/connect - Client requests connection with pro
// GET /api/connect - Get connection history
// ============================================================================

import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, validationError } from "@/lib/responses";
import { URGENCY_LEVELS } from "@/types";

const connectSchema = z.object({
  proClerkId: z.string(),
  serviceType: z.string().optional(),
  urgency: z.enum(URGENCY_LEVELS).optional(),
  notes: z.string().optional(),
});

// ============================================================================
// POST /api/connect - Create connection request
// ============================================================================

export async function POST(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const clientClerkId = auth.clerkUserId;
  if (!clientClerkId) {
    return errorResponse("Missing clerkUserId in token", 400);
  }

  try {
    const body = await req.json();
    const validated = connectSchema.parse(body);

    // Check if pro profile exists
    const proProfile = await prisma.tradeProfile.findUnique({
      where: { clerkUserId: validated.proClerkId },
    });

    if (!proProfile) {
      return errorResponse("Pro profile not found", 404);
    }

    if (!proProfile.acceptingClients) {
      return errorResponse("Pro is not accepting new clients", 400);
    }

    // Check for existing connection
    const existing = await prisma.clientProConnection.findUnique({
      where: {
        clientClerkId_proClerkId: {
          clientClerkId,
          proClerkId: validated.proClerkId,
        },
      },
    });

    if (existing && existing.status === "pending") {
      return errorResponse("Connection request already pending", 400);
    }

    if (existing && existing.status === "accepted") {
      return errorResponse("Already connected with this pro", 400);
    }

    // Create connection request
    const connection = await prisma.clientProConnection.create({
      data: {
        clientClerkId,
        proClerkId: validated.proClerkId,
        serviceType: validated.serviceType,
        urgency: validated.urgency,
        notes: validated.notes,
        status: "pending",
      },
    });

    return successResponse({ connection }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationError(error.errors.map((e) => e.message).join(", "));
    }
    console.error("[Connect POST] Error:", error);
    return errorResponse("Failed to create connection", 500);
  }
}

// ============================================================================
// GET /api/connect - Get connections for user
// Query: ?role=client|pro&status=pending|accepted|declined
// ============================================================================

export async function GET(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const clerkUserId = auth.clerkUserId;
  if (!clerkUserId) {
    return errorResponse("Missing clerkUserId in token", 400);
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "client";
  const status = searchParams.get("status") || undefined;

  try {
    const where: any =
      role === "pro" ? { proClerkId: clerkUserId } : { clientClerkId: clerkUserId };

    if (status) {
      where.status = status;
    }

    const connections = await prisma.clientProConnection.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ connections, count: connections.length }, 200);
  } catch (error) {
    console.error("[Connect GET] Error:", error);
    return errorResponse("Failed to fetch connections", 500);
  }
}
