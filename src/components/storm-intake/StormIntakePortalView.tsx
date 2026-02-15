"use client";

import { Card } from "@/components/ui/card";
import { StormIntakeDTO } from "@/lib/storm-intake/types";

import { StormIntakeProvider } from "./StormIntakeContext";
import StormIntakeWizard from "./StormIntakeWizard";

interface Props {
  initialIntake: StormIntakeDTO;
  readonlyMode?: boolean;
}

/**
 * Portal/internal storm intake view wrapper.
 * Used for viewing or editing intake submissions within the authenticated portal.
 */
export default function StormIntakePortalView({ initialIntake, readonlyMode }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Storm Intake Assessment</h1>
        <p className="text-sm text-muted-foreground">
          {readonlyMode ? "View mode" : "Edit mode"} • Status: {initialIntake.status}
        </p>
      </div>

      {/* Main Card */}
      <Card className="p-6">
        <StormIntakeProvider initialIntake={initialIntake}>
          <StormIntakeWizard readonlyMode={readonlyMode} />
        </StormIntakeProvider>
      </Card>

      {/* Metadata */}
      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          Created: {new Date(initialIntake.createdAt as any).toLocaleString()} • Last updated:{" "}
          {new Date(initialIntake.updatedAt as any).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
