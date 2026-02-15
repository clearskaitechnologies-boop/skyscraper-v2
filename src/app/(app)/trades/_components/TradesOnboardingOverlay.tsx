/**
 * Trades Onboarding Wizard Overlay
 *
 * Shows a modal overlay prompting users to create their trades profile
 * when they visit the Network Hub without a profile
 */

"use client";

import { Building2, Rocket, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface TradesOnboardingOverlayProps {
  hasProfile: boolean;
}

export function TradesOnboardingOverlay({ hasProfile }: TradesOnboardingOverlayProps) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user has a profile or dismissed
  if (hasProfile || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
            <Users className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8 text-center">
          <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            Company Connections
          </span>
          <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
            Launch your trades profile
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Create your profile once and it automatically appears in the directory and Company
            Connections. You can finish the rest of onboarding later.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Showcase your company to potential clients
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
            <Rocket className="h-5 w-5 text-green-600" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Get discovered by homeowners and contractors
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/50">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Connect with verified trades professionals
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Link href="/trades/onboarding">Start Profile Setup</Link>
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setDismissed(true)}>
            Browse Trades Network
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-xs text-slate-500">
          Saving is instant and non-blocking. You can edit anytime and still keep using the app
          while you build out your profile.
        </p>
      </div>
    </div>
  );
}
