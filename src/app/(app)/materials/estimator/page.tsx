"use client";

import { Calculator, Package, RotateCcw, Truck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EstimateResult {
  materials: Array<{
    name: string;
    quantity: number;
    unit: string;
    coverage: string;
  }>;
  totalSquares: number;
  wastePercent: number;
  pitchMultiplier: number;
}

const ROOF_PITCHES = [
  { label: "Flat (0-2/12)", value: "flat" },
  { label: "Low (3-4/12)", value: "low" },
  { label: "Standard (5-7/12)", value: "standard" },
  { label: "Steep (8-10/12)", value: "steep" },
  { label: "Very Steep (11-12/12)", value: "very_steep" },
];

const SHINGLE_TYPES = [
  { label: "3-Tab Asphalt", value: "3tab" },
  { label: "Architectural Shingle", value: "architectural" },
  { label: "Designer / Premium", value: "designer" },
  { label: "Metal Standing Seam", value: "metal" },
  { label: "Tile", value: "tile" },
];

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";

export default function MaterialEstimatorPage() {
  const [totalSqFt, setTotalSqFt] = useState("");
  const [pitch, setPitch] = useState("standard");
  const [shingleType, setShingleType] = useState("architectural");
  const [ridgeLf, setRidgeLf] = useState("");
  const [valleyLf, setValleyLf] = useState("");
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [routeStatus, setRouteStatus] = useState<"idle" | "routing" | "routed">("idle");

  const handleEstimate = async () => {
    if (!totalSqFt || Number(totalSqFt) <= 0) {
      setError("Enter a valid roof area in square feet");
      return;
    }

    setIsLoading(true);
    setError("");
"use client";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
    try {
      const res = await fetch("/api/materials/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "calculate",
          measurements: {
            totalSqFt: Number(totalSqFt),
            pitch,
            ridgeLinearFt: ridgeLf ? Number(ridgeLf) : undefined,
            valleyLinearFt: valleyLf ? Number(valleyLf) : undefined,
          },
          shingleType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Estimation failed");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteToABC = async () => {
    setRouteStatus("routing");
    try {
      const res = await fetch("/api/materials/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "route",
          measurements: {
            totalSqFt: Number(totalSqFt),
            pitch,
            ridgeLinearFt: ridgeLf ? Number(ridgeLf) : undefined,
            valleyLinearFt: valleyLf ? Number(valleyLf) : undefined,
          },
          shingleType,
        }),
      });

      if (!res.ok) throw new Error("Failed to route to ABC Supply");
      setRouteStatus("routed");
    } catch (err: any) {
      setError(err.message);
      setRouteStatus("idle");
    }
  };

  const handleReset = () => {
    setTotalSqFt("");
    setPitch("standard");
    setShingleType("architectural");
    setRidgeLf("");
    setValleyLf("");
    setResult(null);
    setError("");
    setRouteStatus("idle");
  };

  return (
    <PageContainer maxWidth="5xl">
      <PageHero
        section="materials"
        title="Material Estimator"
        subtitle="Calculate materials from roof measurements. Route orders to ABC Supply with one click."
        icon={<Calculator className="h-7 w-7" />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Roof Measurements</CardTitle>
            <CardDescription>
              Enter measurements from your inspection or Xactimate sketch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sqft">Total Roof Area (sq ft) *</Label>
              <Input
                id="sqft"
                type="number"
                placeholder="2,400"
                value={totalSqFt}
                onChange={(e) => setTotalSqFt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Roof Pitch</Label>
              <Select value={pitch} onValueChange={setPitch}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOF_PITCHES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shingle Type</Label>
              <Select value={shingleType} onValueChange={setShingleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHINGLE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ridge">Ridge (linear ft)</Label>
                <Input
                  id="ridge"
                  type="number"
                  placeholder="60"
                  value={ridgeLf}
                  onChange={(e) => setRidgeLf(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valley">Valley (linear ft)</Label>
                <Input
                  id="valley"
                  type="number"
                  placeholder="30"
                  value={valleyLf}
                  onChange={(e) => setValleyLf(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handleEstimate} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  "Calculating..."
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Materials
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Material List
            </CardTitle>
            <CardDescription>
              {result
                ? `${result.totalSquares} squares • ${result.wastePercent}% waste factor • ${result.pitchMultiplier}x pitch`
                : "Enter measurements and click Calculate"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                  {result.materials.map((mat, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{mat.name}</p>
                        <p className="text-xs text-slate-500">{mat.coverage}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {mat.quantity}
                        </span>
                        <span className="ml-1 text-sm text-slate-500">{mat.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Route to ABC Supply */}
                <Button
                  onClick={handleRouteToABC}
                  disabled={routeStatus !== "idle"}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {routeStatus === "routing" ? (
                    "Routing to ABC Supply..."
                  ) : routeStatus === "routed" ? (
                    <>
                      <Truck className="mr-2 h-4 w-4" />✅ Routed to ABC Supply
                    </>
                  ) : (
                    <>
                      <Truck className="mr-2 h-4 w-4" />
                      Route to ABC Supply
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-3 h-12 w-12 text-slate-200 dark:text-slate-700" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Material list will appear here after calculation
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
