"use client";

/**
 * 🏠 CLIENT PORTAL WRAPPER
 *
 * Wraps the client portal dashboard and shows onboarding wizard
 * for new users who haven't completed their profile.
 */

import { useEffect, useState } from "react";

import { ClientOnboardingWizard } from "@/components/onboarding/ClientOnboardingWizard";

interface ClientPortalWrapperProps {
  children: React.ReactNode;
  needsOnboarding: boolean;
}

export function ClientPortalWrapper({ children, needsOnboarding }: ClientPortalWrapperProps) {
  const [showWizard, setShowWizard] = useState(needsOnboarding);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem("client_onboarding_dismissed");
    if (dismissed && !needsOnboarding) {
      setShowWizard(false);
    }
  }, [needsOnboarding]);

  const handleComplete = () => {
    setShowWizard(false);
    setIsComplete(true);
    // Refresh page to load new profile data
    window.location.reload();
  };

  const handleSkip = () => {
    setShowWizard(false);
    localStorage.setItem("client_onboarding_dismissed", "true");
  };

  return (
    <>
      {children}
      {showWizard && !isComplete && (
        <ClientOnboardingWizard onComplete={handleComplete} onSkip={handleSkip} />
      )}
    </>
  );
}

export default ClientPortalWrapper;
