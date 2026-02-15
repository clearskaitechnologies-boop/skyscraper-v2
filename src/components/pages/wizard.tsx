import Head from "next/head";
import { useEffect } from "react";

import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { JobWizard } from "@/components/wizard/JobWizard";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function WizardPage() {
  const { hasCompletedOnboarding, startOnboarding } = useOnboardingStore();

  useEffect(() => {
    // Start onboarding for first-time users
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startOnboarding]);

  return (
    <>
      <Head>
        <title>Create New Job | SkaiScraper</title>
        <meta name="description" content="Create a new AI-powered roof inspection report" />
      </Head>

      <JobWizard />
      <OnboardingOverlay />
    </>
  );
}
