"use client";

import { Upload } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";

import { useStormIntake } from "../StormIntakeContext";

interface Props {
  readonly?: boolean;
}

export default function Step4_MediaUpload({ readonly }: Props) {
  const { intake, savePartial } = useStormIntake();

  const handleNext = async () => {
    if (readonly) return;
    await savePartial({ step: 5 });
  };

  const handleBack = async () => {
    if (readonly) return;
    await savePartial({ step: 3 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">Upload Photos & Videos</h2>
        <p className="text-sm text-muted-foreground">
          Add images or videos of the damage (optional).
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
        <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="mb-4 text-sm text-muted-foreground">
          Drag and drop files here, or click to browse
        </p>
        <Button variant="outline" disabled={readonly}>
          Select Files
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Supports: JPG, PNG, HEIC, MP4, MOV (max 50MB each)
        </p>
      </div>

      {/* Media preview grid - TODO: Implement upload functionality */}
      {intake.media && intake.media.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {intake.media.map((item) => (
            <div key={item.id} className="aspect-square rounded-lg border bg-muted" />
          ))}
        </div>
      )}

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
