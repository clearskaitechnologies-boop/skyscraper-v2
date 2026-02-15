import { motion } from "framer-motion";
import { Check } from "lucide-react";
import React from "react";

import { useWizardStore } from "@/stores/wizardStore";

export const WizardProgress: React.FC = () => {
  const { currentStep, steps } = useWizardStore();

  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = step.completed;
            const isClickable = index < currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <motion.div
                  className={`relative flex flex-col items-center ${
                    isClickable ? "cursor-pointer" : ""
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isActive
                        ? "scale-110 border-blue-600 bg-blue-600 text-white"
                        : isCompleted
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="mx-4 h-0.5 flex-1">
                    <div
                      className={`h-full transition-all duration-500 ${
                        step.completed ? "bg-green-600" : "bg-gray-300"
                      }`}
                      style={{
                        width: step.completed ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
