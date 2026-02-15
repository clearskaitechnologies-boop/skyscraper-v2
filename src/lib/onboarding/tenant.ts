/**
 * TASK 138: TENANT ONBOARDING
 *
 * Guided onboarding with progress tracking and tutorials.
 */

import prisma from "@/lib/prisma";

export type OnboardingStep = "PROFILE" | "TEAM" | "INTEGRATION" | "CUSTOMIZATION" | "FIRST_PROJECT";

export interface OnboardingProgress {
  tenantId: string;
  completedSteps: OnboardingStep[];
  currentStep: OnboardingStep;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  "PROFILE",
  "TEAM",
  "INTEGRATION",
  "CUSTOMIZATION",
  "FIRST_PROJECT",
];

export async function initializeOnboarding(tenantId: string): Promise<void> {
  await prisma.onboardingProgress.create({
    data: {
      tenantId,
      completedSteps: [],
      currentStep: "PROFILE",
      progress: 0,
      startedAt: new Date(),
    } as any,
  });
}

export async function getOnboardingProgress(tenantId: string): Promise<OnboardingProgress | null> {
  const progress = await prisma.onboardingProgress.findUnique({
    where: { tenantId },
  });
  return progress as any;
}

export async function completeOnboardingStep(
  tenantId: string,
  step: OnboardingStep
): Promise<void> {
  const progress = await getOnboardingProgress(tenantId);
  if (!progress) return;

  const completedSteps = [...(progress.completedSteps as OnboardingStep[]), step];
  const progressPercent = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  const nextStepIndex = ONBOARDING_STEPS.indexOf(step) + 1;
  const currentStep =
    nextStepIndex < ONBOARDING_STEPS.length ? ONBOARDING_STEPS[nextStepIndex] : step;

  const updates: any = {
    completedSteps: completedSteps as any,
    currentStep,
    progress: progressPercent,
  };

  if (progressPercent === 100) {
    updates.completedAt = new Date();
  }

  await prisma.onboardingProgress.update({
    where: { tenantId },
    data: updates,
  });
}

export async function getOnboardingTutorials(): Promise<
  {
    step: OnboardingStep;
    title: string;
    description: string;
    videoUrl?: string;
  }[]
> {
  return [
    {
      step: "PROFILE",
      title: "Complete Your Profile",
      description: "Set up your organization profile and branding",
      videoUrl: "https://example.com/tutorials/profile",
    },
    {
      step: "TEAM",
      title: "Invite Your Team",
      description: "Add team members and assign roles",
      videoUrl: "https://example.com/tutorials/team",
    },
    {
      step: "INTEGRATION",
      title: "Connect Integrations",
      description: "Set up third-party integrations",
      videoUrl: "https://example.com/tutorials/integrations",
    },
    {
      step: "CUSTOMIZATION",
      title: "Customize Your Workspace",
      description: "Configure settings and preferences",
      videoUrl: "https://example.com/tutorials/customization",
    },
    {
      step: "FIRST_PROJECT",
      title: "Create Your First Project",
      description: "Start your first claim or job",
      videoUrl: "https://example.com/tutorials/first-project",
    },
  ];
}
