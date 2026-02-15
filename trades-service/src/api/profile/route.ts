// ============================================================================
// POST /api/profile - Create or update trade profile
// ============================================================================

import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorResponse, successResponse, validationError } from "@/lib/responses";
import { TRADE_TYPES } from "@/types";

const profileSchema = z.object({
  companyName: z.string().optional(),
  tradeType: z.enum(TRADE_TYPES),
  specialties: z.array(z.string()).optional(),
  bio: z.string().optional(),
  portfolio: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().optional(),
        type: z.enum(["image", "video"]),
      })
    )
    .optional(),
  licenseNumber: z.string().optional(),
  insured: z.boolean(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url().optional(),
        expiresAt: z.string().optional(),
      })
    )
    .optional(),
  baseZip: z
    .string()
    .regex(/^\d{5}$/)
    .optional(),
  radiusMiles: z.number().int().min(5).max(200),
  serviceZips: z.array(z.string().regex(/^\d{5}$/)).optional(),
  acceptingClients: z.boolean(),
  emergencyService: z.boolean(),
});

export async function POST(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const clerkUserId = auth.clerkUserId;
  if (!clerkUserId) {
    return errorResponse("Missing clerkUserId in token", 400);
  }

  try {
    const body = await req.json();
    const validated = profileSchema.parse(body);

    // Upsert profile
    const profile = await prisma.tradeProfile.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        ...validated,
        specialties: validated.specialties || [],
        portfolio: validated.portfolio || [],
        certifications: validated.certifications || [],
        serviceZips: validated.serviceZips || [],
      },
      update: {
        ...validated,
        specialties: validated.specialties || [],
        portfolio: validated.portfolio || [],
        certifications: validated.certifications || [],
        serviceZips: validated.serviceZips || [],
      },
    });

    return successResponse({ profile }, 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationError(error.errors.map((e) => e.message).join(", "));
    }
    console.error("[Profile POST] Error:", error);
    return errorResponse("Failed to save profile", 500);
  }
}

// ============================================================================
// GET /api/profile?clerkUserId=xxx - Get trade profile
// ============================================================================

export async function GET(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const clerkUserId = searchParams.get("clerkUserId");

  if (!clerkUserId) {
    return validationError("Missing clerkUserId parameter");
  }

  try {
    const profile = await prisma.tradeProfile.findUnique({
      where: { clerkUserId },
    });

    if (!profile) {
      return errorResponse("Profile not found", 404);
    }

    return successResponse({ profile }, 200);
  } catch (error) {
    console.error("[Profile GET] Error:", error);
    return errorResponse("Failed to fetch profile", 500);
  }
}

// ============================================================================
// PATCH /api/profile - Partial update of trade profile
// ============================================================================

export async function PATCH(req: NextRequest) {
  // Verify service token
  const auth = requireAuth(req);
  if (auth instanceof Response) return auth;

  const clerkUserId = auth.clerkUserId;
  if (!clerkUserId) {
    return errorResponse("Missing clerkUserId in token", 400);
  }

  try {
    const body = await req.json();

    // Check if profile exists
    const existing = await prisma.tradeProfile.findUnique({
      where: { clerkUserId },
    });

    if (!existing) {
      return errorResponse("Profile not found - create one first", 404);
    }

    // Update only provided fields
    const profile = await prisma.tradeProfile.update({
      where: { clerkUserId },
      data: body as any, // Body comes from validated client request
    });

    return successResponse({ profile }, 200);
  } catch (error) {
    console.error("[Profile PATCH] Error:", error);
    return errorResponse("Failed to update profile", 500);
  }
}
