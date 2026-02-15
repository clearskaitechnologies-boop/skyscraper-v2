import { AnimatePresence,motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check,Save } from "lucide-react";
import React, { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizardStore";

interface WizardScreenProps {
  children: ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  canProgress?: boolean;
  isLastStep?: boolean;
}

export const WizardScreen: React.FC<WizardScreenProps> = ({
  children,
  onNext,
  onPrev,
  canProgress = true,
  isLastStep = false,
}) => {
  const { currentStep, nextStep, prevStep, isAutoSaving, lastSaved } = useWizardStore();

  const handleNext = () => {
    if (canProgress) {
      onNext?.();
      if (!isLastStep) {
        nextStep();
      }
    }
  };

  const handlePrev = () => {
    onPrev?.();
    prevStep();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="mx-auto w-full max-w-2xl"
      >
        {/* Auto-save Indicator */}
        {isAutoSaving && (
          <div className="mb-4 flex items-center justify-end text-sm text-gray-500">
            <Save className="mr-2 h-4 w-4 animate-pulse" />
            <span>Saving...</span>
          </div>
        )}
        {lastSaved && !isAutoSaving && (
          <div className="mb-4 flex items-center justify-end text-sm text-green-600">
            <Check className="mr-2 h-4 w-4" />
            <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
          </div>
        )}

        {/* Screen Content */}
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-xl">{children}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProgress}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isLastStep ? "Submit Job" : "Continue"}
            {!isLastStep && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
