"use client";

import { Briefcase, CheckCircle2, ChevronRight,Home, MessageSquare, Users, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface OnboardingWalkthroughProps {
  clientName: string;
  contractorName: string;
  onComplete: () => void;
}

/**
 * Interactive onboarding walkthrough for first-time portal visitors
 * Shows a multi-step tour of key features with progress tracking
 */
export function OnboardingWalkthrough({
  clientName,
  contractorName,
  onComplete,
}: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Home,
      title: "Welcome to Your Client Portal!",
      description: `Hi ${clientName}! This is your personal dashboard for working with ${contractorName}.`,
      bullets: [
        "View all your projects in one place",
        "Track progress and updates in real-time",
        "Access important documents anytime",
        "Communicate directly with your team",
      ],
    },
    {
      icon: Briefcase,
      title: "View Your Projects",
      description: "See all your active and completed projects with detailed status updates.",
      bullets: [
        "Click 'Projects' to view shared project details",
        "See photos, reports, and estimates",
        "Track project milestones and timelines",
        "Download documents and invoices",
      ],
    },
    {
      icon: MessageSquare,
      title: "Stay Connected",
      description: "Keep in touch with your contractor through our built-in messaging system.",
      bullets: [
        "Send messages directly to your contractor",
        "Receive instant notifications",
        "Share photos and documents",
        "Get answers to your questions quickly",
      ],
    },
    {
      icon: Users,
      title: "Find Trusted Professionals",
      description: "Need additional services? Browse our network of verified professionals.",
      bullets: [
        "View profiles of trusted contractors",
        "Check licenses and certifications",
        "Submit service requests easily",
        "Get quotes from multiple pros",
      ],
    },
  ];

  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onComplete}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close walkthrough"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 sm:p-12">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-center text-2xl font-bold sm:text-3xl">
            {currentStepData.title}
          </h2>

          {/* Description */}
          <p className="mb-6 text-center text-muted-foreground">{currentStepData.description}</p>

          {/* Features List */}
          <ul className="mb-8 space-y-3">
            {currentStepData.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <span className="text-sm">{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Progress Dots */}
          <div className="mb-6 flex justify-center gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                      ? "bg-primary/50"
                      : "bg-muted"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="flex-1"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={() => {
                if (isLastStep) {
                  onComplete();
                } else {
                  setCurrentStep((s) => s + 1);
                }
              }}
              className="flex-1"
            >
              {isLastStep ? (
                "Get Started"
              ) : (
                <>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          {!isLastStep && (
            <div className="mt-4 text-center">
              <button
                onClick={onComplete}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Skip tour
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
