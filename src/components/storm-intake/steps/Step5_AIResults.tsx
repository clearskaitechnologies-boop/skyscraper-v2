"use client";

import { CheckCircle, Download } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { completeStormIntake } from "@/lib/storm-intake/api";
import { toast } from "@/lib/storm-intake/toast";

import { useStormIntake } from "../StormIntakeContext";

interface Props {
  readonly?: boolean;
}

export default function Step5_AIResults({ readonly }: Props) {
  const { intake } = useStormIntake();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const toastId = toast.stormIntake.completing();

    try {
      await completeStormIntake(intake.id);
      toast.dismiss(toastId);
      toast.stormIntake.completed();

      // If homeowner email was provided, show email sent notification
      if ((intake as any).homeownerEmail) {
        setTimeout(() => toast.stormIntake.emailSent(), 500);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.dismiss(toastId);
      toast.stormIntake.completeError();
    } finally {
      setIsGenerating(false);
    }
  };

  const severity = intake.severityScore ?? 0;
  const stormEvent = intake.stormEvent;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Assessment Complete</h2>
        <p className="text-sm text-muted-foreground">Here's your property storm damage summary.</p>
      </div>

      {/* Severity Score */}
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <span className="text-3xl font-bold">{severity}</span>
        </div>
        <p className="mb-1 text-sm font-medium">Overall Severity Score</p>
        <p className="text-xs text-muted-foreground">
          {severity >= 70
            ? "High Risk - Professional inspection strongly recommended"
            : severity >= 40
              ? "Moderate Risk - Consider professional assessment"
              : "Low Risk - Continue monitoring"}
        </p>
      </div>

      {/* Storm Event Summary */}
      {stormEvent && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">Storm Event History</p>
          {stormEvent.hailDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Hail Event:</span>{" "}
              {new Date(stormEvent.hailDate).toLocaleDateString()}
              {stormEvent.hailSize && ` (${stormEvent.hailSize}" diameter)`}
            </div>
          )}
          {stormEvent.windDate && (
            <div className="text-sm">
              <span className="text-muted-foreground">Wind Event:</span>{" "}
              {new Date(stormEvent.windDate).toLocaleDateString()}
              {stormEvent.windSpeed && ` (${stormEvent.windSpeed} mph)`}
            </div>
          )}
          {stormEvent.stormsLast12Months !== null && (
            <div className="text-sm">
              <span className="text-muted-foreground">Total Storms (12mo):</span>{" "}
              {stormEvent.stormsLast12Months}
            </div>
          )}
          <p className="text-xs text-muted-foreground">Data provided by {stormEvent.provider}</p>
        </div>
      )}

      {/* Damage Indicators */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-sm font-medium">Damage Indicators</p>
        <div className="space-y-2">
          {intake.hailDamage && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Hail damage present</span>
            </div>
          )}
          {intake.windDamage && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Wind damage present</span>
            </div>
          )}
          {intake.leaksPresent && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Active leaks detected</span>
            </div>
          )}
          {intake.interiorDamage && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Interior damage noted</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={handleGenerateReport}
          disabled={isGenerating || readonly}
        >
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Full Report"}
        </Button>

        {intake.reportUrl && (
          <Button variant="outline" className="w-full" asChild>
            <a href={intake.reportUrl} download>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
