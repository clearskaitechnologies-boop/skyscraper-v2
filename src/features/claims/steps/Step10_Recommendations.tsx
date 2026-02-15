// src/features/claims/steps/Step10_Recommendations.tsx
"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface Step10Data {
  recommendation?: string;
  urgency?: string;
  additionalComments?: string;
  nextSteps?: string;
}

interface Step10Props {
  data: Partial<Step10Data>;
  onChange: (data: Partial<Step10Data>) => void;
}

export function Step10_Recommendations({ data, onChange }: Step10Props) {
  const updateField = (field: keyof Step10Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Recommendations</h2>
        <p className="mt-2 text-sm text-slate-600">
          Final recommendations and next steps for this claim.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommendation">Primary Recommendation</Label>
        <Select
          value={data.recommendation || ""}
          onValueChange={(value) => updateField("recommendation", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select recommendation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approve-full">Approve Full Claim</SelectItem>
            <SelectItem value="approve-partial">Approve Partial Claim</SelectItem>
            <SelectItem value="deny">Deny Claim</SelectItem>
            <SelectItem value="further-review">Further Review Required</SelectItem>
            <SelectItem value="supplement">Supplement Needed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency Level</Label>
        <Select value={data.urgency || ""} onValueChange={(value) => updateField("urgency", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="critical">Critical - Immediate Action</SelectItem>
            <SelectItem value="high">High - Within 7 Days</SelectItem>
            <SelectItem value="medium">Medium - Within 30 Days</SelectItem>
            <SelectItem value="low">Low - Routine Processing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nextSteps">Next Steps</Label>
        <Textarea
          id="nextSteps"
          value={data.nextSteps || ""}
          onChange={(e) => updateField("nextSteps", e.target.value)}
          placeholder="Outline the next steps in the claims process..."
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalComments">Additional Comments</Label>
        <Textarea
          id="additionalComments"
          value={data.additionalComments || ""}
          onChange={(e) => updateField("additionalComments", e.target.value)}
          placeholder="Any other relevant comments or considerations..."
          rows={4}
        />
      </div>
    </div>
  );
}
