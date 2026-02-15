import { AlertTriangle } from "lucide-react";
import React, { useState } from "react";

import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/stores/wizardStore";

import { WizardScreen } from "../WizardScreen";

const DAMAGE_TYPES = [
  "Hail Damage",
  "Wind Damage",
  "Fire Damage",
  "Water Damage",
  "Storm Damage",
  "Structural Damage",
  "Other",
];

const SEVERITY_LEVELS = [
  {
    id: "minor",
    label: "Minor",
    description: "Cosmetic damage, no immediate risk",
  },
  { id: "moderate", label: "Moderate", description: "Some functional impact" },
  {
    id: "severe",
    label: "Severe",
    description: "Significant damage, needs urgent attention",
  },
] as const;

export const DamageScreen: React.FC = () => {
  const { jobData, updateJobData, completeStep } = useWizardStore();
  const [damageType, setDamageType] = useState<string[]>(jobData.damageType || []);
  const [severity, setSeverity] = useState(jobData.severity || "");

  const canProgress = damageType.length > 0 && severity;

  const toggleDamageType = (type: string) => {
    setDamageType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleNext = () => {
    updateJobData({ damageType, severity: severity as any });
    completeStep("damage");
  };

  return (
    <WizardScreen onNext={handleNext} canProgress={!!canProgress}>
      <div className="space-y-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Damage Assessment</h2>
            <p className="text-gray-600">What kind of damage are we dealing with?</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Damage Types */}
          <div>
            <Label className="mb-3 block">Select all that apply:</Label>
            <div className="grid grid-cols-2 gap-3">
              {DAMAGE_TYPES.map((type) => {
                const isSelected = damageType.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleDamageType(type)}
                    className={`rounded-lg border-2 px-4 py-3 transition-all duration-200 ${
                      isSelected
                        ? "border-orange-600 bg-orange-50 font-semibold text-orange-700"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity */}
          <div>
            <Label className="mb-3 block">Severity Level:</Label>
            <div className="space-y-3">
              {SEVERITY_LEVELS.map((level) => {
                const isSelected = severity === level.id;
                return (
                  <button
                    key={level.id}
                    onClick={() => setSeverity(level.id)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-orange-600 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{level.label}</div>
                    <div className="mt-1 text-sm text-gray-600">{level.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </WizardScreen>
  );
};
