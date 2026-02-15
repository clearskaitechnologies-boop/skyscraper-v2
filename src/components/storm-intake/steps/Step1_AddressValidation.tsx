"use client";

import { AlertCircle,Cloud, Loader2, MapPin } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/storm-intake/toast";
import { step1Schema } from "@/lib/storm-intake/validation";

import { useStormIntake } from "../StormIntakeContext";

interface Props {
  readonly?: boolean;
}

export default function Step1_AddressValidation({ readonly }: Props) {
  const { intake, savePartial, isSaving } = useStormIntake();
  const [localAddress, setLocalAddress] = useState(intake.address || "");
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleNext = async () => {
    if (readonly) return;

    // Validate
    const result = step1Schema.safeParse({ address: localAddress });
    if (!result.success) {
      const errorMessages = result.error.errors.map((e) => e.message);
      setErrors(errorMessages);
      toast.stormIntake.invalidAddress();
      return;
    }
    setErrors([]);

    setIsLoadingWeather(true);
    const toastId = toast.stormIntake.weatherLoading();
    try {
      await savePartial({
        address: localAddress,
        step: 2,
      });
      toast.dismiss(toastId);
      toast.stormIntake.weatherLoaded();
    } catch (error) {
      toast.dismiss(toastId);
      toast.stormIntake.weatherError();
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const stormEvent = intake.stormEvent;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Property Address</h2>
        <p className="text-sm text-muted-foreground">
          Enter the address where you'd like to check for storm damage.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            disabled={readonly}
            className="pl-10"
            placeholder="123 Main St, City, State ZIP"
            value={localAddress}
            onChange={(e) => {
              setLocalAddress(e.target.value);
              setErrors([]);
            }}
          />
        </div>
        {errors.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{errors[0]}</span>
          </div>
        )}
      </div>

      {/* Storm event card */}
      {stormEvent && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Cloud className="mt-0.5 h-5 w-5 text-blue-500" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Storm Activity Detected</p>
              {stormEvent.hailDate && (
                <p className="text-sm text-muted-foreground">
                  🧊 Hail event on {new Date(stormEvent.hailDate).toLocaleDateString()}
                  {stormEvent.hailSize && ` (${stormEvent.hailSize}" diameter)`}
                </p>
              )}
              {stormEvent.windDate && (
                <p className="text-sm text-muted-foreground">
                  💨 High winds on {new Date(stormEvent.windDate).toLocaleDateString()}
                  {stormEvent.windSpeed && ` (${stormEvent.windSpeed} mph)`}
                </p>
              )}
              {stormEvent.stormsLast12Months !== null && (
                <p className="text-sm text-muted-foreground">
                  ⚡ {stormEvent.stormsLast12Months} storm events in last 12 months
                </p>
              )}
              <p className="text-xs text-muted-foreground">Data from {stormEvent.provider}</p>
            </div>
          </div>
        </div>
      )}

      {!stormEvent && intake.step > 1 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            ✅ No significant storm events detected in the last 12 months
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={readonly || !localAddress.trim() || isSaving || isLoadingWeather}
        >
          {(isSaving || isLoadingWeather) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoadingWeather ? "Checking Weather..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
