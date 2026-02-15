"use client";

import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
  render: () => ReactNode;
};

type WizardProps = {
  steps: WizardStep[];
  onFinishAction?: () => void;
};

export function Wizard({ steps, onFinishAction }: WizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentStep = steps[currentIndex];

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  function goNext() {
    if (isLast) {
      onFinishAction?.();
      return;
    }
    setCurrentIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goPrev() {
    if (isFirst) return;
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{currentStep.title}</h1>
          {currentStep.description && (
            <p className="text-sm text-muted-foreground">
              {currentStep.description}
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </div>
      </div>

      {/* Step dots / progress */}
      <div className="flex gap-2">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            type="button"
            title={`Go to step ${idx + 1}: ${step.title}`}
            className={`h-2 flex-1 rounded-full transition-colors ${
              idx <= currentIndex ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>

      <Card className="bg-card p-6">
        {currentStep.render()}
      </Card>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          onClick={goPrev}
          disabled={isFirst}
          variant="outline"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={goNext}
        >
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
