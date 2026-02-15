"use client";

import { AlertCircle } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/storm-intake/toast";

import { useStormIntake } from "../StormIntakeContext";

interface Props {
  readonly?: boolean;
}

export default function Step3_DamageChecklist({ readonly }: Props) {
  const { intake, savePartial } = useStormIntake();
  const [hailDamage, setHailDamage] = useState(intake.hailDamage ?? false);
  const [windDamage, setWindDamage] = useState(intake.windDamage ?? false);
  const [leaksPresent, setLeaksPresent] = useState(intake.leaksPresent ?? false);
  const [interiorDamage, setInteriorDamage] = useState(intake.interiorDamage ?? false);
  const [error, setError] = useState<string | null>(null);

  // Calculate severity score (0-100)
  const calculateSeverity = () => {
    let score = 0;
    if (hailDamage) score += 30;
    if (windDamage) score += 25;
    if (leaksPresent) score += 25;
    if (interiorDamage) score += 20;
    return score;
  };

  const severity = calculateSeverity();

  const handleNext = async () => {
    if (readonly) return;

    // Validation: At least one damage indicator must be selected
    if (!hailDamage && !windDamage && !leaksPresent && !interiorDamage) {
      setError("Please select at least one damage indicator");
      toast.stormIntake.invalidDamage();
      return;
    }

    setError(null);
    await savePartial({
      hailDamage,
      windDamage,
      leaksPresent,
      interiorDamage,
      severityScore: severity,
      step: 4,
    });
  };

  const handleBack = async () => {
    if (readonly) return;
    await savePartial({ step: 2 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Damage Indicators</h2>
        <p className="text-sm text-muted-foreground">Check all that apply to your property.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hail"
            checked={hailDamage}
            onCheckedChange={(checked) => {
              setHailDamage(!!checked);
              setError(null);
            }}
            disabled={readonly}
          />
          <Label htmlFor="hail" className="cursor-pointer">
            🧊 Visible hail damage (dents, missing granules)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="wind"
            checked={windDamage}
            onCheckedChange={(checked) => {
              setWindDamage(!!checked);
              setError(null);
            }}
            disabled={readonly}
          />
          <Label htmlFor="wind" className="cursor-pointer">
            💨 Wind damage (lifted shingles, creases)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="leaks"
            checked={leaksPresent}
            onCheckedChange={(checked) => {
              setLeaksPresent(!!checked);
              setError(null);
            }}
            disabled={readonly}
          />
          <Label htmlFor="leaks" className="cursor-pointer">
            💧 Active leaks or water stains
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="interior"
            checked={interiorDamage}
            onCheckedChange={(checked) => {
              setInteriorDamage(!!checked);
              setError(null);
            }}
            disabled={readonly}
          />
          <Label htmlFor="interior" className="cursor-pointer">
            🏠 Interior damage (ceiling, walls, floors)
          </Label>
        </div>
      </div>

      {/* Severity meter */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Damage Severity</span>
          <span className="text-2xl font-bold">{severity}/100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${
              severity >= 70 ? "bg-red-500" : severity >= 40 ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ width: `${severity}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {severity >= 70
            ? "High severity - Immediate inspection recommended"
            : severity >= 40
              ? "Moderate severity - Professional assessment advised"
              : "Low severity - Monitor for changes"}
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={readonly}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={readonly}>
          Continue
        </Button>
      </div>
    </div>
  );
}
