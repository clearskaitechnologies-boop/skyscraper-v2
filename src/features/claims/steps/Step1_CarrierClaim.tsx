// src/features/claims/steps/Step1_CarrierClaim.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface Step1Data {
  insuranceCarrier: string;
  claimNumber: string;
  dateOfLoss: string;
  adjusterName?: string;
  adjusterPhone?: string;
  adjusterEmail?: string;
  policyNumber?: string;
  lossType?: string;
  initialNotes?: string;
}

interface Step1Props {
  data: Partial<Step1Data>;
  onChange: (data: Partial<Step1Data>) => void;
}

export function Step1_CarrierClaim({ data, onChange }: Step1Props) {
  const updateField = (field: keyof Step1Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Carrier & Claim Information</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter the insurance carrier and claim details to get started.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Insurance Carrier */}
        <div className="space-y-2">
          <Label htmlFor="insuranceCarrier" className="required">
            Insurance Carrier
          </Label>
          <Input
            id="insuranceCarrier"
            value={data.insuranceCarrier || ""}
            onChange={(e) => updateField("insuranceCarrier", e.target.value)}
            placeholder="e.g., State Farm, Allstate, USAA"
            required
          />
        </div>

        {/* Claim Number */}
        <div className="space-y-2">
          <Label htmlFor="claimNumber" className="required">
            Claim Number
          </Label>
          <Input
            id="claimNumber"
            value={data.claimNumber || ""}
            onChange={(e) => updateField("claimNumber", e.target.value)}
            placeholder="e.g., CLM-2024-12345"
            required
          />
        </div>

        {/* Date of Loss */}
        <div className="space-y-2">
          <Label htmlFor="dateOfLoss" className="required">
            Date of Loss
          </Label>
          <Input
            id="dateOfLoss"
            type="date"
            value={data.dateOfLoss || ""}
            onChange={(e) => updateField("dateOfLoss", e.target.value)}
            required
          />
        </div>

        {/* Loss Type */}
        <div className="space-y-2">
          <Label htmlFor="lossType">Loss Type</Label>
          <Select
            value={data.lossType || ""}
            onValueChange={(value) => updateField("lossType", value)}
          >
            <SelectTrigger id="lossType">
              <SelectValue placeholder="Select loss type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hail">Hail Damage</SelectItem>
              <SelectItem value="wind">Wind Damage</SelectItem>
              <SelectItem value="hurricane">Hurricane</SelectItem>
              <SelectItem value="tornado">Tornado</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="water">Water Damage</SelectItem>
              <SelectItem value="lightning">Lightning Strike</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Policy Number */}
        <div className="space-y-2">
          <Label htmlFor="policyNumber">Policy Number</Label>
          <Input
            id="policyNumber"
            value={data.policyNumber || ""}
            onChange={(e) => updateField("policyNumber", e.target.value)}
            placeholder="Optional policy number"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Adjuster Information</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Adjuster Name */}
          <div className="space-y-2">
            <Label htmlFor="adjusterName">Adjuster Name</Label>
            <Input
              id="adjusterName"
              value={data.adjusterName || ""}
              onChange={(e) => updateField("adjusterName", e.target.value)}
              placeholder="Full name"
            />
          </div>

          {/* Adjuster Phone */}
          <div className="space-y-2">
            <Label htmlFor="adjusterPhone">Adjuster Phone</Label>
            <Input
              id="adjusterPhone"
              type="tel"
              value={data.adjusterPhone || ""}
              onChange={(e) => updateField("adjusterPhone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Adjuster Email */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="adjusterEmail">Adjuster Email</Label>
            <Input
              id="adjusterEmail"
              type="email"
              value={data.adjusterEmail || ""}
              onChange={(e) => updateField("adjusterEmail", e.target.value)}
              placeholder="adjuster@carrier.com"
            />
          </div>
        </div>
      </div>

      {/* Initial Notes */}
      <div className="space-y-2">
        <Label htmlFor="initialNotes">Initial Notes</Label>
        <Textarea
          id="initialNotes"
          value={data.initialNotes || ""}
          onChange={(e) => updateField("initialNotes", e.target.value)}
          placeholder="Any preliminary observations or important details..."
          rows={4}
        />
      </div>
    </div>
  );
}
