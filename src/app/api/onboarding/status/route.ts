/**
 * GET  /api/onboarding/status — Check onboarding completion state
 * POST /api/onboarding/status — Mark onboarding step as complete
 *
 * Stores onboarding progress in Clerk user metadata.
 * Used by the getting-started checklist on the dashboard.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";

/**
 * Default onboarding steps for new users.
 * Each step has a key and a completed flag.
 */
const DEFAULT_STEPS = {
  profileComplete: false,
  companySetup: false,
  firstClaimCreated: false,
  teamInvited: false,
  documentsUploaded: false,
  dashboardViewed: true, // Auto-marked when they hit this endpoint
};

export const GET = withAuth(async (_req: NextRequest, { userId }) => {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata as Record<string, any>) || {};

    const onboarding = meta.onboarding || DEFAULT_STEPS;
    const allComplete = Object.values(onboarding).every(Boolean);

    return NextResponse.json({
      onboardingComplete: meta.onboardingComplete === true || allComplete,
      steps: onboarding,
      dismissedAt: meta.onboardingDismissedAt || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch onboarding status" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest, { userId }) => {
  try {
    const body = await req.json();
    const { step, dismissed } = body as { step?: string; dismissed?: boolean };

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata as Record<string, any>) || {};
    const currentSteps = meta.onboarding || { ...DEFAULT_STEPS };

    if (dismissed) {
      // User dismissed the checklist entirely
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...meta,
          onboardingComplete: true,
          onboardingDismissedAt: new Date().toISOString(),
        },
      });
      return NextResponse.json({ onboardingComplete: true });
    }

    if (step && step in currentSteps) {
      currentSteps[step] = true;
    }

    const allComplete = Object.values(currentSteps).every(Boolean);

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...meta,
        onboarding: currentSteps,
        onboardingComplete: allComplete,
      },
    });

    return NextResponse.json({
      onboardingComplete: allComplete,
      steps: currentSteps,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update onboarding status" },
      { status: 500 }
    );
  }
});
