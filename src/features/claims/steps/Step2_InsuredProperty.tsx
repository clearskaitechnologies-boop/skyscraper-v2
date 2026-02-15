// src/features/claims/steps/Step2_InsuredProperty.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Step2Data {
  insured_name: string;
  insuredPhone?: string;
  insuredEmail?: string;
  propertyAddress: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  propertyType?: string;
  yearBuilt?: string;
  squareFootage?: string;
  occupancyStatus?: string;
  additionalNotes?: string;
}

interface Step2Props {
  data: Partial<Step2Data>;
  onChange: (data: Partial<Step2Data>) => void;
}

export function Step2_InsuredProperty({ data, onChange }: Step2Props) {
  const updateField = (field: keyof Step2Data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Insured & Property Details
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Information about the property owner and damaged property.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Insured Information
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Insured Name */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="insured_name" className="required">
              Insured Name
            </Label>
            <Input
              id="insured_name"
              value={data.insured_name || ""}
              onChange={(e) => updateField("insured_name", e.target.value)}
              placeholder="Full name of property owner"
              required
            />
          </div>

          {/* Insured Phone */}
          <div className="space-y-2">
            <Label htmlFor="insuredPhone">Phone Number</Label>
            <Input
              id="insuredPhone"
              type="tel"
              value={data.insuredPhone || ""}
              onChange={(e) => updateField("insuredPhone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Insured Email */}
          <div className="space-y-2">
            <Label htmlFor="insuredEmail">Email Address</Label>
            <Input
              id="insuredEmail"
              type="email"
              value={data.insuredEmail || ""}
              onChange={(e) => updateField("insuredEmail", e.target.value)}
              placeholder="owner@email.com"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Property Information
        </h3>
        <div className="grid gap-6">
          {/* Property Address */}
          <div className="space-y-2">
            <Label htmlFor="propertyAddress" className="required">
              Property Address
            </Label>
            <Input
              id="propertyAddress"
              value={data.propertyAddress || ""}
              onChange={(e) => updateField("propertyAddress", e.target.value)}
              placeholder="Street address"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="propertyCity">City</Label>
              <Input
                id="propertyCity"
                value={data.propertyCity || ""}
                onChange={(e) => updateField("propertyCity", e.target.value)}
                placeholder="City"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="propertyState">State</Label>
              <Input
                id="propertyState"
                value={data.propertyState || ""}
                onChange={(e) => updateField("propertyState", e.target.value)}
                placeholder="State"
                maxLength={2}
              />
            </div>

            {/* ZIP */}
            <div className="space-y-2">
              <Label htmlFor="propertyZip">ZIP Code</Label>
              <Input
                id="propertyZip"
                value={data.propertyZip || ""}
                onChange={(e) => updateField("propertyZip", e.target.value)}
                placeholder="ZIP"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Property Type */}
            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Input
                id="propertyType"
                value={data.propertyType || ""}
                onChange={(e) => updateField("propertyType", e.target.value)}
                placeholder="e.g., Single Family, Multi-Family"
              />
            </div>

            {/* Year Built */}
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={data.yearBuilt || ""}
                onChange={(e) => updateField("yearBuilt", e.target.value)}
                placeholder="YYYY"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>

            {/* Square Footage */}
            <div className="space-y-2">
              <Label htmlFor="squareFootage">Square Footage</Label>
              <Input
                id="squareFootage"
                type="number"
                value={data.squareFootage || ""}
                onChange={(e) => updateField("squareFootage", e.target.value)}
                placeholder="Total sq ft"
                min="0"
              />
            </div>

            {/* Occupancy Status */}
            <div className="space-y-2">
              <Label htmlFor="occupancyStatus">Occupancy Status</Label>
              <Input
                id="occupancyStatus"
                value={data.occupancyStatus || ""}
                onChange={(e) => updateField("occupancyStatus", e.target.value)}
                placeholder="e.g., Owner Occupied, Rental"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              value={data.additionalNotes || ""}
              onChange={(e) => updateField("additionalNotes", e.target.value)}
              placeholder="Any special considerations, access instructions, etc."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
