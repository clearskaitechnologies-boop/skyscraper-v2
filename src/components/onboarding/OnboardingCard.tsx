"use client";

import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
}

interface OnboardingCardProps {
  steps?: OnboardingStep[];
  onDismiss?: () => void;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: "profile",
    title: "Complete your company profile",
    description: "Add your company name and basic info",
    completed: false,
    href: "/settings/branding",
  },
  {
    id: "branding",
    title: "Upload logo & brand colors",
    description: "Customize your documents with your brand",
    completed: false,
    href: "/settings/branding",
  },
  {
    id: "billing",
    title: "Start free trial or add payment",
    description: "Choose a plan that fits your needs",
    completed: false,
    href: "/billing",
  },
  {
    id: "first-report",
    title: "Generate your first AI Damage Report",
    description: "Experience the power of AI-driven documentation",
    completed: false,
    href: "/dashboard",
  },
];

export default function OnboardingCard({ steps = defaultSteps, onDismiss }: OnboardingCardProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const allComplete = completedCount === totalCount;
  const progressPercent = (completedCount / totalCount) * 100;

  if (allComplete) {
    return null; // Hide card when all steps complete
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-neutral-900">
            Get Started with SkaiScraper
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Complete these steps to unlock the full power of your CRM
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-neutral-400 hover:text-neutral-600"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">
            {completedCount} of {totalCount} complete
          </span>
          <span className="font-medium text-blue-600">{Math.round(progressPercent)}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ul className="mt-5 space-y-3">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50"
            >
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-neutral-300" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.completed ? "text-neutral-500 line-through" : "text-neutral-900"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-neutral-500">{step.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-5 flex gap-3">
        <Link
          href={steps.find((s) => !s.completed)?.href || "/dashboard"}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Continue Setup →
        </Link>
      </div>
    </div>
  );
}
