// src/features/claims/steps/Step8_PhotosEvidence.tsx
"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Step8Data {
  photoNotes?: string;
  evidenceDescription?: string;
}

interface Step8Props {
  data: Partial<Step8Data>;
  onChange: (data: Partial<Step8Data>) => void;
}

export function Step8_PhotosEvidence({ data, onChange }: Step8Props) {
  const updateField = (field: keyof Step8Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Photos & Evidence
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload photos and document evidence supporting the claim.
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <Upload className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-4 text-sm font-medium text-slate-900">
          Photo Upload (Phase 2)
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Firebase Storage integration coming in Phase 2
        </p>
        <Button variant="outline" className="mt-4" disabled>
          Select Files
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoNotes">Photo Notes</Label>
        <Textarea
          id="photoNotes"
          value={data.photoNotes || ""}
          onChange={(e) => updateField("photoNotes", e.target.value)}
          placeholder="Notes about photos to be uploaded (e.g., 'North elevation showing hail damage', 'Interior ceiling water stains')..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evidenceDescription">Additional Evidence</Label>
        <Textarea
          id="evidenceDescription"
          value={data.evidenceDescription || ""}
          onChange={(e) => updateField("evidenceDescription", e.target.value)}
          placeholder="Description of other evidence (weather reports, prior inspections, etc.)..."
          rows={4}
        />
      </div>
    </div>
  );
}
