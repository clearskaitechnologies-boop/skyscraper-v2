"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ClaimPacketData } from "@/lib/claims/templates";
import { cn } from "@/lib/utils";

interface Step1Props {
  data: ClaimPacketData;
  updateData: (updates: Partial<ClaimPacketData>) => void;
  validationErrors?: string[];
}

/**
 * Step 1: Client & Property Information
 *
 * Required Fields:
 * - insured_name (homeowner/client name)
 * - propertyAddress (full street address)
 *
 * Optional Fields:
 * - preparedBy (contractor/inspector name)
 * - preparedPhone (contractor phone)
 * - preparedEmail (contractor email)
 * - inspectionDate (date of property inspection)
 */
export function Step1_ClientProperty({ data, updateData, validationErrors }: Step1Props) {
  const hasError = (field: string) => {
    return validationErrors?.some((err) => err.toLowerCase().includes(field.toLowerCase()));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Client & Property Information</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the basic details about the property owner and location. Required fields are marked
          with an asterisk (*).
        </p>
      </div>

      {/* Client Information */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">Client Details</h3>

        {/* Insured Name (REQUIRED) */}
        <div className="space-y-2">
          <Label htmlFor="insured_name" className="text-sm font-medium">
            Homeowner/Client Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="insured_name"
            type="text"
            placeholder="John Smith"
            value={data.insured_name || ""}
            onChange={(e) => updateData({ insured_name: e.target.value })}
            className={cn(
              "w-full",
              hasError("insured_name") && "border-red-500 focus-visible:ring-red-500"
            )}
            aria-required="true"
            aria-invalid={hasError("insured_name")}
          />
          {hasError("insured_name") && (
            <p className="text-sm text-red-600">Client name is required</p>
          )}
        </div>

        {/* Property Address (REQUIRED) */}
        <div className="space-y-2">
          <Label htmlFor="propertyAddress" className="text-sm font-medium">
            Property Address <span className="text-red-500">*</span>
          </Label>
          <Input
            id="propertyAddress"
            type="text"
            placeholder="123 Main Street, City, State 12345"
            value={data.propertyAddress || ""}
            onChange={(e) => updateData({ propertyAddress: e.target.value })}
            className={cn(
              "w-full",
              hasError("propertyAddress") && "border-red-500 focus-visible:ring-red-500"
            )}
            aria-required="true"
            aria-invalid={hasError("propertyAddress")}
          />
          {hasError("propertyAddress") && (
            <p className="text-sm text-red-600">Property address is required</p>
          )}
          <p className="text-xs text-gray-500">
            Include full street address, city, state, and ZIP code
          </p>
        </div>
      </div>

      {/* Inspector/Contractor Information */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">
          Inspector/Contractor Details
        </h3>

        {/* Prepared By */}
        <div className="space-y-2">
          <Label htmlFor="preparedBy" className="text-sm font-medium">
            Prepared By
          </Label>
          <Input
            id="preparedBy"
            type="text"
            placeholder="Your name or company representative"
            value={data.preparedBy || ""}
            onChange={(e) => updateData({ preparedBy: e.target.value })}
            className="w-full"
          />
          <p className="text-xs text-gray-500">Name of the person preparing this packet</p>
        </div>

        {/* Phone & Email (Side by Side on Desktop) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Prepared Phone */}
          <div className="space-y-2">
            <Label htmlFor="preparedPhone" className="text-sm font-medium">
              Contact Phone
            </Label>
            <Input
              id="preparedPhone"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.preparedPhone || ""}
              onChange={(e) => updateData({ preparedPhone: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Prepared Email */}
          <div className="space-y-2">
            <Label htmlFor="preparedEmail" className="text-sm font-medium">
              Contact Email
            </Label>
            <Input
              id="preparedEmail"
              type="email"
              placeholder="contractor@example.com"
              value={data.preparedEmail || ""}
              onChange={(e) => updateData({ preparedEmail: e.target.value })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Inspection Date */}
      <div className="space-y-6">
        <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">Inspection Details</h3>

        <div className="space-y-2">
          <Label htmlFor="inspectionDate" className="text-sm font-medium">
            Inspection Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="inspectionDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.inspectionDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.inspectionDate ? (
                  format(new Date(data.inspectionDate), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.inspectionDate ? new Date(data.inspectionDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    updateData({ inspectionDate: date.toISOString() });
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-gray-500">Date when the property was inspected</p>
        </div>
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
              <strong>Tip:</strong> Make sure the client name and property address match official
              documents. This information will appear on the final packet cover page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
