"use client";

import React from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ClaimPacketData } from "@/lib/claims/templates";
import { cn } from "@/lib/utils";

interface Step3Props {
  data: ClaimPacketData;
  updateData: (updates: Partial<ClaimPacketData>) => void;
  validationErrors?: string[];
}

/**
 * Step 3: Financing Options (NEW)
 *
 * Required Fields:
 * - If financingAvailable = true, then financingPartners required
 *
 * Optional Fields:
 * - financingAvailable (toggle)
 * - financingPartners (multiselect - array of partner names)
 * - financingAPR (example APR rate)
 * - financingTermMonths (example term length)
 * - financingQRCode (QR code URL for financing application)
 */
export function Step3_Financing({ data, updateData, validationErrors }: Step3Props) {
  const hasError = (field: string) => {
    return validationErrors?.some((err) => err.toLowerCase().includes(field.toLowerCase()));
  };

  // Available financing partners
  const availablePartners = [
    "GreenSky",
    "Synchrony",
    "Service Finance",
    "FTL Finance",
    "HFS Financial",
    "Wells Fargo",
    "Marcus by Goldman Sachs",
    "LightStream",
  ];

  // Toggle financing partner
  const togglePartner = (partner: string) => {
    const currentPartners = data.financingPartners || [];
    const isSelected = currentPartners.includes(partner);

    const newPartners = isSelected
      ? currentPartners.filter((p) => p !== partner)
      : [...currentPartners, partner];

    updateData({ financingPartners: newPartners });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financing Options</h2>
        <p className="mt-2 text-sm text-gray-600">
          Configure financing options to help homeowners afford your services. This section will
          appear as a dedicated page in the final packet.
        </p>
      </div>

      {/* Financing Availability Toggle */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">
          Financing Availability
        </h3>

        <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
          <div className="flex-1">
            <Label htmlFor="financingAvailable" className="cursor-pointer text-sm font-medium">
              Offer Financing Options
            </Label>
            <p className="mt-1 text-xs text-gray-500">
              Enable this to show financing partners and payment calculator in the packet
            </p>
          </div>
          <Switch
            id="financingAvailable"
            checked={data.financingAvailable || false}
            onCheckedChange={(checked) => {
              updateData({ financingAvailable: checked });
              // Clear partners if turning off financing
              if (!checked) {
                updateData({ financingPartners: [] });
              }
            }}
          />
        </div>
      </div>

      {/* Financing Partners (Conditional on financingAvailable) */}
      {data.financingAvailable && (
        <>
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">
              Financing Partners{" "}
              {hasError("financingPartners") && <span className="text-red-500">*</span>}
            </h3>

            <div>
              <Label className="text-sm font-medium">
                Select Financing Partners{" "}
                {data.financingAvailable && <span className="text-red-500">*</span>}
              </Label>
              <p className="mb-3 mt-1 text-xs text-gray-500">
                Choose one or more financing partners you work with
              </p>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {availablePartners.map((partner) => {
                  const isSelected = data.financingPartners?.includes(partner) || false;
                  return (
                    <button
                      key={partner}
                      type="button"
                      onClick={() => togglePartner(partner)}
                      className={cn(
                        "rounded-lg border-2 p-3 text-sm font-medium transition-all",
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      )}
                    >
                      {partner}
                    </button>
                  );
                })}
              </div>

              {hasError("financingPartners") && (
                <p className="mt-2 text-sm text-red-600">
                  At least one financing partner is required when financing is enabled
                </p>
              )}

              {data.financingPartners && data.financingPartners.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.financingPartners.map((partner) => (
                    <Badge key={partner} variant="secondary">
                      {partner}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Example Financing Terms */}
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">
              Example Financing Terms
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* APR */}
              <div className="space-y-2">
                <Label htmlFor="financingAPR" className="text-sm font-medium">
                  Example APR (%)
                </Label>
                <Input
                  id="financingAPR"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="5.99"
                  value={data.financingAPR || ""}
                  onChange={(e) =>
                    updateData({ financingAPR: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Example annual percentage rate (for display purposes)
                </p>
              </div>

              {/* Term */}
              <div className="space-y-2">
                <Label htmlFor="financingTermMonths" className="text-sm font-medium">
                  Example Term (months)
                </Label>
                <Input
                  id="financingTermMonths"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="120"
                  value={data.financingTermMonths || ""}
                  onChange={(e) =>
                    updateData({ financingTermMonths: parseInt(e.target.value) || undefined })
                  }
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Example loan term in months (e.g., 60, 120, 240)
                </p>
              </div>
            </div>
          </div>

          {/* QR Code (Optional) */}
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">
              Financing Application
            </h3>

            <div className="space-y-2">
              <Label htmlFor="financingQRCode" className="text-sm font-medium">
                QR Code URL (Optional)
              </Label>
              <Input
                id="financingApplicationQRCode"
                type="url"
                placeholder="https://example.com/financing-application"
                value={data.financingApplicationQRCode || ""}
                onChange={(e) => updateData({ financingApplicationQRCode: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                URL that will be converted to a QR code for easy mobile access to financing
                application
              </p>
            </div>
          </div>
        </>
      )}

      {/* Help Text */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Offering financing options can significantly increase close
              rates. The generated packet will include a dedicated financing page with partner
              logos, payment calculator, and QR code for easy application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
