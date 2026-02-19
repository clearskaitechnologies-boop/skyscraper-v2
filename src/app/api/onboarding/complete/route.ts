/**
 * PHASE 3: Onboarding Completion API
 * Marks org as onboardingCompleted when wizard finishes
 * Ensures proper context refresh and redirect
 */

import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";
import { isTestMode } from "@/lib/testMode";

const onboardingCompleteSchema = z.object({
  companyInfo: z
    .object({
      name: z.string().min(1).optional(),
    })
    .optional(),
  teamMembers: z.array(z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getTenant } = await import("@/lib/auth/tenant");
    const orgId = await getTenant();

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = onboardingCompleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { companyInfo, teamMembers } = parsed.data;

    // Update org with onboarding completion
    const org = await prisma.org.update({
      where: { id: orgId },
      data: {
        onboardingCompleted: true,
        // Optionally save company info if provided
        ...(companyInfo?.name && { name: companyInfo.name }),
        updatedAt: new Date(),
      } as unknown as Record<string, unknown>,
    });

    // Revalidate paths that check onboarding status
    revalidatePath("/dashboard");
    revalidatePath("/contacts");
    revalidatePath("/(app)", "layout");

    const testModeActive = isTestMode();

    logger.info(`[Onboarding] Org ${orgId} marked as onboardingCompleted`, {
      testMode: testModeActive,
      companyName: companyInfo?.name,
    });

    return NextResponse.json({
      success: true,
      org,
      testMode: testModeActive,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    logger.error("[Onboarding] Completion failed:", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
