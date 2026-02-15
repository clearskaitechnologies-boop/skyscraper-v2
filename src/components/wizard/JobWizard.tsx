import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { useWizardStore } from "@/stores/wizardStore";

import { DamageScreen } from "./screens/DamageScreen";
import { DetailsScreen } from "./screens/DetailsScreen";
import { JobTypeScreen } from "./screens/JobTypeScreen";
import { LocationScreen } from "./screens/LocationScreen";
import { PhotosScreen } from "./screens/PhotosScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { WizardProgress } from "./WizardProgress";

export const JobWizard: React.FC = () => {
  const { currentStep, jobData, updateJobData, setAutoSaving, setLastSaved } = useWizardStore();
  const router = useRouter();

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (Object.keys(jobData).length > 0) {
        setAutoSaving(true);
        try {
          await fetch("/api/wizard/auto-save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobData }),
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error("Auto-save failed:", error);
        } finally {
          setAutoSaving(false);
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [jobData, setAutoSaving, setLastSaved]);

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <LocationScreen />;
      case 1:
        return <JobTypeScreen />;
      case 2:
        return <DetailsScreen />;
      case 3:
        return <DamageScreen />;
      case 4:
        return <PhotosScreen />;
      case 5:
        return <ReviewScreen />;
      default:
        return <LocationScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">AI Job Wizard</h1>
          <p className="text-lg text-gray-600">
            Answer one question at a time - we'll handle the rest
          </p>
        </div>

        {/* Progress Bar */}
        <WizardProgress />

        {/* Current Screen */}
        <div className="mt-12">{renderScreen()}</div>
      </div>
    </div>
  );
};
