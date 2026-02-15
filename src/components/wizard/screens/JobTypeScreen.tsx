import { Building, Factory,Home } from "lucide-react";
import React, { useState } from "react";

import { Label } from "@/components/ui/label";
import { useWizardStore } from "@/stores/wizardStore";

import { WizardScreen } from "../WizardScreen";

const JOB_TYPES = [
  {
    id: "residential",
    label: "Residential",
    icon: Home,
    description: "Single-family homes, apartments, condos",
  },
  {
    id: "commercial",
    label: "Commercial",
    icon: Building,
    description: "Offices, retail stores, warehouses",
  },
  {
    id: "industrial",
    label: "Industrial",
    icon: Factory,
    description: "Factories, manufacturing facilities",
  },
] as const;

export const JobTypeScreen: React.FC = () => {
  const { jobData, updateJobData, completeStep } = useWizardStore();
  const [selected, setSelected] = useState<string>(jobData.jobType || "");

  const canProgress = !!selected;

  const handleNext = () => {
    updateJobData({ jobType: selected as any });
    completeStep("jobType");
  };

  return (
    <WizardScreen onNext={handleNext} canProgress={canProgress}>
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">What type of property is this?</h2>
          <p className="text-gray-600">This helps us apply the right regulations and pricing</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {JOB_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selected === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={`rounded-xl border-2 p-6 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      isSelected ? "bg-blue-600" : "bg-gray-100"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-gray-600"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{type.label}</h3>
                    <p className="mt-1 text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </WizardScreen>
  );
};
