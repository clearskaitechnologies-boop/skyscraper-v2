"use client";

import { useEffect, useState } from "react";

import { OnboardingWalkthrough } from "@/components/portal/OnboardingWalkthrough";

interface PortalOnboardingWrapperProps {
  clientName: string;
  contractorName: string;
  children: React.ReactNode;
}

const ONBOARDING_KEY = "portal_onboarding_completed";

/**
 * Wrapper component that shows onboarding walkthrough to first-time portal visitors
 * Uses localStorage to track completion status
 */
export function PortalOnboardingWrapper({
  clientName,
  contractorName,
  children,
}: PortalOnboardingWrapperProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
    setIsReady(true);
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  // Don't render anything until we've checked localStorage
  if (!isReady) {
    return null;
  }

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingWalkthrough
          clientName={clientName}
          contractorName={contractorName}
          onComplete={handleComplete}
        />
      )}
    </>
  );
}
