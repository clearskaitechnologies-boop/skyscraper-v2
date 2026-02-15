"use client";

import React from "react";

import { StormIntakeDTO } from "@/lib/storm-intake/types";

import { StormIntakeProvider } from "./StormIntakeContext";
import StormIntakeWizard from "./StormIntakeWizard";

interface Props {
  initialIntake: StormIntakeDTO;
}

/**
 * Public-facing storm intake flow wrapper.
 * Used for anonymous/public intake submissions.
 */
export default function StormIntakePublicView({ initialIntake }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Storm Damage Assessment</h1>
          <p className="text-muted-foreground">
            Get a free AI-powered property damage report in 90 seconds
          </p>
        </div>

        {/* Wizard Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
          <StormIntakeProvider initialIntake={initialIntake}>
            <StormIntakeWizard />
          </StormIntakeProvider>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by SkaiScraper • Live Weather Intelligence</p>
        </div>
      </div>
    </div>
  );
}
