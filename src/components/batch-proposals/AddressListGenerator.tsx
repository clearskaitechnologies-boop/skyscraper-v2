"use client";

/**
 * Address List CSV Generator Component
 *
 * Converts polygon data + home count into downloadable CSV address list
 * Can be used standalone or integrated into Community Reports batch flow
 */

import { Download, FileSpreadsheet, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressListGeneratorProps {
  polygonData?: any; // GeoJSON polygon from map drawing
  homeCount?: number;
  onAddressListGenerated?: (addresses: string[]) => void;
}

export function AddressListGenerator({
  polygonData,
  homeCount: initialHomeCount,
  onAddressListGenerated,
}: AddressListGeneratorProps) {
  const [homeCount, setHomeCount] = useState(initialHomeCount || 100);
  const [generating, setGenerating] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);

  const generateAddressList = async () => {
    setGenerating(true);
    try {
      // Call API to generate address list from polygon + home count
      const response = await fetch("/api/batch/generate-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          polygon: polygonData,
          estimatedHomes: homeCount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate addresses");
      }

      const data = await response.json();
      const generatedAddresses = data.addresses || [];

      setAddresses(generatedAddresses);
      onAddressListGenerated?.(generatedAddresses);

      toast.success(`Generated ${generatedAddresses.length} addresses`);
    } catch (error) {
      console.error("Address generation error:", error);
      toast.error("Failed to generate address list");
    } finally {
      setGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (addresses.length === 0) {
      toast.error("No addresses to download");
      return;
    }

    // Create CSV content
    const csvContent = [
      "Address,City,State,Zip", // Header
      ...addresses.map((addr) => {
        // Parse address string into components
        const parts = addr.split(",").map((p) => p.trim());
        return parts.join(",");
      }),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `batch-addresses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("CSV downloaded successfully");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <CardTitle>Address List Generator</CardTitle>
        </div>
        <CardDescription>Generate CSV address list from polygon + home count</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Home Count Input */}
        <div>
          <Label htmlFor="homeCount">Estimated Home Count</Label>
          <Input
            id="homeCount"
            type="number"
            min={1}
            max={10000}
            value={homeCount}
            onChange={(e) => setHomeCount(Number(e.target.value))}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Number of homes in selected polygon area
          </p>
        </div>

        {/* Polygon Status */}
        {polygonData && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm dark:bg-green-900/20">
            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-green-700 dark:text-green-300">
              Polygon defined ({polygonData.coordinates?.length || 0} points)
            </span>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateAddressList}
          disabled={generating || !polygonData}
          className="w-full"
        >
          {generating ? (
            <>Generating...</>
          ) : (
            <>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Generate Address List
            </>
          )}
        </Button>

        {/* Results */}
        {addresses.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-semibold">Generated {addresses.length} addresses</p>
              <div className="mt-2 max-h-40 overflow-y-auto text-xs">
                {addresses.slice(0, 10).map((addr, idx) => (
                  <div key={idx} className="py-1 text-muted-foreground">
                    {addr}
                  </div>
                ))}
                {addresses.length > 10 && (
                  <p className="pt-1 italic text-muted-foreground">
                    + {addresses.length - 10} more addresses
                  </p>
                )}
              </div>
            </div>

            {/* Download Button */}
            <Button onClick={downloadCSV} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          </div>
        )}

        {/* Instructions */}
        {!polygonData && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-900 dark:bg-amber-900/20">
            <p className="font-semibold text-amber-900 dark:text-amber-400">How to use:</p>
            <ol className="ml-4 mt-1 list-decimal space-y-1 text-amber-700 dark:text-amber-300">
              <li>Draw a polygon on the map to select your area</li>
              <li>Enter the estimated number of homes</li>
              <li>Click "Generate Address List"</li>
              <li>Download the CSV for batch processing</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
