// src/features/claims/steps/Step6_InspectionFindings.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Step6Data {
  inspectionDate?: string;
  inspector?: string;
  weatherConditions?: string;
  findings?: string;
  recommendations?: string;
}

interface Step6Props {
  data: Partial<Step6Data>;
  onChange: (data: Partial<Step6Data>) => void;
}

export function Step6_InspectionFindings({ data, onChange }: Step6Props) {
  const updateField = (field: keyof Step6Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Inspection Findings
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Document your inspection observations and findings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="inspectionDate">Inspection Date</Label>
          <Input
            id="inspectionDate"
            type="date"
            value={data.inspectionDate || ""}
            onChange={(e) => updateField("inspectionDate", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspector">Inspector Name</Label>
          <Input
            id="inspector"
            value={data.inspector || ""}
            onChange={(e) => updateField("inspector", e.target.value)}
            placeholder="Inspector name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weatherConditions">Weather Conditions During Inspection</Label>
        <Input
          id="weatherConditions"
          value={data.weatherConditions || ""}
          onChange={(e) => updateField("weatherConditions", e.target.value)}
          placeholder="e.g., Clear, 65°F"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="findings">Detailed Findings</Label>
        <Textarea
          id="findings"
          value={data.findings || ""}
          onChange={(e) => updateField("findings", e.target.value)}
          placeholder="Document all inspection findings in detail..."
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommendations">Inspector Recommendations</Label>
        <Textarea
          id="recommendations"
          value={data.recommendations || ""}
          onChange={(e) => updateField("recommendations", e.target.value)}
          placeholder="Recommendations based on inspection findings..."
          rows={6}
        />
      </div>
    </div>
  );
}
