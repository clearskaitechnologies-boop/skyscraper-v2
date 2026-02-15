"use client";

import { AlertCircle } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/storm-intake/toast";
import { step2Schema } from "@/lib/storm-intake/validation";

import { useStormIntake } from "../StormIntakeContext";

interface Props {
  readonly?: boolean;
}

export default function Step2_StructureDetails({ readonly }: Props) {
  const { intake, savePartial } = useStormIntake();
  const [roofType, setRoofType] = useState(intake.roofType || "");
  const [sqFt, setSqFt] = useState(intake.houseSqFt?.toString() || "");
  const [yearBuilt, setYearBuilt] = useState(intake.yearBuilt?.toString() || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = async () => {
    if (readonly) return;

    // Validate
    const result = step2Schema.safeParse({
      roofType,
      houseSqFt: sqFt ? parseInt(sqFt) : undefined,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
    });

    if (!result.success) {
      const errorMap: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        errorMap[e.path[0] as string] = e.message;
      });
      setErrors(errorMap);
      toast.stormIntake.invalidRoof();
      return;
    }
    setErrors({});

    await savePartial({
      roofType: roofType as any,
      houseSqFt: sqFt ? parseInt(sqFt) : undefined,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : undefined,
      step: 3,
    });
  };

  const handleBack = async () => {
    if (readonly) return;
    await savePartial({ step: 1 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Structure Details</h2>
        <p className="text-sm text-muted-foreground">Tell us about the property structure.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Roof Type *</Label>
          <Select
            value={roofType}
            onValueChange={(val) => {
              setRoofType(val);
              setErrors((prev) => ({ ...prev, roofType: "" }));
            }}
            disabled={readonly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select roof type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHINGLE">Asphalt Shingle</SelectItem>
              <SelectItem value="TILE">Tile</SelectItem>
              <SelectItem value="METAL">Metal</SelectItem>
              <SelectItem value="FLAT">Flat/TPO</SelectItem>
              <SelectItem value="FOAM">Foam</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.roofType && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{errors.roofType}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Square Footage</Label>
            <Input
              type="number"
              placeholder="2000"
              value={sqFt}
              onChange={(e) => {
                setSqFt(e.target.value);
                setErrors((prev) => ({ ...prev, houseSqFt: "" }));
              }}
              disabled={readonly}
            />
            {errors.houseSqFt && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{errors.houseSqFt}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Year Built</Label>
            <Input
              type="number"
              placeholder="1990"
              value={yearBuilt}
              onChange={(e) => {
                setYearBuilt(e.target.value);
                setErrors((prev) => ({ ...prev, yearBuilt: "" }));
              }}
              disabled={readonly}
            />
            {errors.yearBuilt && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{errors.yearBuilt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={readonly}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={readonly || !roofType}>
          Continue
        </Button>
      </div>
    </div>
  );
}
