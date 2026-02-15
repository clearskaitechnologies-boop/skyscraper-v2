"use client";

import React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClaimPacketData } from "@/lib/claims/templates";
import { cn } from "@/lib/utils";

interface Step2Props {
  data: ClaimPacketData;
  updateData: (updates: Partial<ClaimPacketData>) => void;
  validationErrors?: string[];
}

/**
 * Step 2: Materials & Upgrades
 *
 * Required Fields:
 * - roofType (architectural shingle, metal, tile, etc.)
 *
 * Optional Fields:
 * - materialChoice (specific product/brand)
 * - upgrade checkboxes (premium materials, enhanced warranty, etc.)
 */
export function Step2_MaterialsUpgrades({ data, updateData, validationErrors }: Step2Props) {
  const hasError = (field: string) => {
    return validationErrors?.some((err) => err.toLowerCase().includes(field.toLowerCase()));
  };

  // Roof type options (matches ClaimPacketData.roofType union)
  const roofTypes = [
    { value: "shingle" as const, label: "Shingle Roofing" },
    { value: "tile" as const, label: "Tile (Clay/Concrete)" },
    { value: "metal" as const, label: "Metal Roofing" },
    { value: "mod-bit" as const, label: "Modified Bitumen" },
    { value: "tpo" as const, label: "TPO Membrane" },
    { value: "spf" as const, label: "Spray Polyurethane Foam" },
    { value: "other" as const, label: "Other" },
  ];

  // Material/brand options (matches ClaimPacketData.materialChoice union)
  const materialChoices = [
    { value: "architectural-shingle" as const, label: "Architectural Shingle" },
    { value: "tile" as const, label: "Tile" },
    { value: "metal" as const, label: "Metal" },
    { value: "mod-bit" as const, label: "Modified Bitumen" },
    { value: "tpo-pvc" as const, label: "TPO/PVC Membrane" },
    { value: "spray-foam" as const, label: "Spray Foam" },
  ];

  // Upgrade options (maps to individual boolean fields in ClaimPacketData)
  const upgrades = [
    {
      field: "includesUnderlaymentUpgrade" as const,
      label: "Upgraded Underlayment",
      description: "Synthetic or premium underlayment",
    },
    {
      field: "atticVentilationUpgrade" as const,
      label: "Attic Ventilation Upgrade",
      description: "Enhanced ridge vents and airflow",
    },
    {
      field: "coolRoofRated" as const,
      label: "Cool Roof Rated",
      description: "Energy Star certified reflective roofing",
    },
    {
      field: "heatReflectiveCoating" as const,
      label: "Heat Reflective Coating",
      description: "Additional reflective coating for energy efficiency",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Materials & Upgrades</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select the roofing materials and any optional upgrades for this project. Required fields
          are marked with an asterisk (*).
        </p>
      </div>

      {/* Roof Type (REQUIRED) */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">Roofing Material</h3>

        <div className="space-y-2">
          <Label htmlFor="roofType" className="text-sm font-medium">
            Roof Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.roofType || ""}
            onValueChange={(value) =>
              updateData({ roofType: value as ClaimPacketData["roofType"] })
            }
          >
            <SelectTrigger
              id="roofType"
              className={cn("w-full", hasError("roofType") && "border-red-500 focus:ring-red-500")}
              aria-required="true"
              aria-invalid={hasError("roofType")}
            >
              <SelectValue placeholder="Select roof type" />
            </SelectTrigger>
            <SelectContent>
              {roofTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError("roofType") && <p className="text-sm text-red-600">Roof type is required</p>}
          <p className="text-xs text-gray-500">Choose the primary roofing material type</p>
        </div>
      </div>

      {/* Material Choice (Optional) */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">
          Specific Product/Brand
        </h3>

        <div className="space-y-2">
          <Label htmlFor="materialChoice" className="text-sm font-medium">
            Material/Brand Selection
          </Label>
          <Select
            value={data.materialChoice || ""}
            onValueChange={(value) =>
              updateData({ materialChoice: value as ClaimPacketData["materialChoice"] })
            }
          >
            <SelectTrigger id="materialChoice" className="w-full">
              <SelectValue placeholder="Select material/brand (optional)" />
            </SelectTrigger>
            <SelectContent>
              {materialChoices.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Specific manufacturer and product line</p>
        </div>
      </div>

      {/* Upgrades (Optional Checkboxes) */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">Optional Upgrades</h3>

        <div className="space-y-4">
          {upgrades.map((upgrade) => (
            <div key={upgrade.field} className="flex items-start space-x-3">
              <Checkbox
                id={upgrade.field}
                checked={data[upgrade.field] === true}
                onCheckedChange={(checked) => updateData({ [upgrade.field]: checked === true })}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={upgrade.field} className="cursor-pointer text-sm font-medium">
                  {upgrade.label}
                </Label>
                <p className="mt-0.5 text-xs text-gray-500">{upgrade.description}</p>
              </div>
            </div>
          ))}
        </div>

        {upgrades.some((u) => data[u.field] === true) && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm text-green-700">
              <strong>
                {upgrades.filter((u) => data[u.field] === true).length} upgrade
                {upgrades.filter((u) => data[u.field] === true).length !== 1 ? "s" : ""} selected
              </strong>
            </p>
          </div>
        )}
      </div>

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
              <strong>Tip:</strong> Selecting upgrades will highlight premium features in the final
              packet. These options help homeowners understand the value of enhanced materials and
              warranties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
