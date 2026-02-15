"use client";

import React from "react";

import Step1_AddressValidation from "./steps/Step1_AddressValidation";
import Step2_StructureDetails from "./steps/Step2_StructureDetails";
import Step3_DamageChecklist from "./steps/Step3_DamageChecklist";
import Step4_MediaUpload from "./steps/Step4_MediaUpload";
import Step5_AIResults from "./steps/Step5_AIResults";
import { useStormIntake } from "./StormIntakeContext";

interface Props {
  readonlyMode?: boolean;
}

export default function StormIntakeWizard({ readonlyMode }: Props) {
  const { intake } = useStormIntake();

  const step = intake.step ?? 1;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_AddressValidation readonly={!!readonlyMode} />;
      case 2:
        return <Step2_StructureDetails readonly={!!readonlyMode} />;
      case 3:
        return <Step3_DamageChecklist readonly={!!readonlyMode} />;
      case 4:
        return <Step4_MediaUpload readonly={!!readonlyMode} />;
      case 5:
      default:
        return <Step5_AIResults readonly={!!readonlyMode} />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Storm Intake</p>
          <h1 className="text-xl font-semibold">90-Second Storm Exposure Check</h1>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground">{step}/5</span>
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-border/60 bg-background/60 p-6 shadow-sm backdrop-blur-sm">
        {renderStep()}
      </div>
    </div>
  );
}
