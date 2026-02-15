"use client";

import { AlertTriangle, Calendar, Cloud, CloudRain, Loader2, MapPin, Wind } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { bubbleCard, bubbleInput, primaryButton } from "@/lib/tesla-styles";

interface WeatherEvent {
  date: string;
  type: string;
  severity: string;
  description: string;
  distance: number;
}

interface WeatherSummary {
  totalEvents: number;
  hailEvents: number;
  windEvents: number;
  maxHailSize?: number;
  maxWindGust?: number;
  dateRange: string;
}

interface WeatherQuickDOLFormProps {
  orgId?: string;
  userId?: string;
  claimId?: string;
}

export default function WeatherQuickDOLForm({ orgId, userId, claimId }: WeatherQuickDOLFormProps) {
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [daysBack, setDaysBack] = useState("90");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dol, setDol] = useState<string | null>(null);
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [summary, setSummary] = useState<WeatherSummary | null>(null);
  const { toast } = useToast();

  const handleGeocode = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data.lat && data.lon) {
        setLat(data.lat.toString());
        setLon(data.lon.toString());
        toast({
          title: "Location Found",
          description: `Coordinates: ${data.lat}, ${data.lon}`,
        });
      }
    } catch (error) {
      console.error("Geocode error:", error);
      toast({
        title: "Geocoding Failed",
        description: "Could not find coordinates for this address",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!address && (!lat || !lon)) {
      toast({
        title: "Missing Location",
        description: "Please enter an address or coordinates",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setDol(null);
    setEvents([]);
    setSummary(null);

    try {
      const response = await fetch("/api/weather/quick-dol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address || `${lat}, ${lon}`,
          lat: lat ? parseFloat(lat) : undefined,
          lon: lon ? parseFloat(lon) : undefined,
          daysBack: parseInt(daysBack),
          orgId,
          claimId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const data = await response.json();
      const result = data.result || data;

      // Handle response
      if (result.dol || result.recommended_date_utc) {
        const dolDate = result.dol || result.recommended_date_utc;
        setDol(dolDate);

        // Format events from scored results
        const scoredEvents = result.scored || result.events || [];
        const formattedEvents = scoredEvents.slice(0, 10).map((event: any) => ({
          date: event.time_utc,
          type:
            event.type === "hail_report"
              ? "Hail Report"
              : event.type === "wind_report"
                ? "Wind Report"
                : "Storm Event",
          severity:
            event.quality_score >= 0.8 ? "High" : event.quality_score >= 0.5 ? "Medium" : "Low",
          description: event.raw_ref || `${event.type} detected`,
          distance: event.distance_miles || 0,
        }));

        setEvents(formattedEvents);

        // Calculate summary statistics
        const hailEvents = formattedEvents.filter((e) => e.type === "Hail Report");
        const windEvents = formattedEvents.filter((e) => e.type === "Wind Report");

        setSummary({
          totalEvents: formattedEvents.length,
          hailEvents: hailEvents.length,
          windEvents: windEvents.length,
          maxHailSize: result.max_hail_inches || undefined,
          maxWindGust: result.max_wind_mph || undefined,
          dateRange: `${new Date(Date.now() - parseInt(daysBack) * 86400000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
        });

        toast({
          title: "Weather Intel Generated",
          description: `Found ${scoredEvents.length} weather events | DOL: ${new Date(dolDate).toLocaleDateString()}`,
        });
      } else {
        toast({
          title: "No Significant Events",
          description: "No weather events found in the specified timeframe",
        });
      }
    } catch (error: any) {
      console.error("Weather analysis error:", error);
      toast({
        title: "Analysis Failed",
        description:
          error.message || "Failed to analyze weather data. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`${bubbleCard} p-6`}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Property Location
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the property address or coordinates to analyze weather patterns
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Property Address
            </label>
            <div className="flex gap-2">
              <input
                id="address"
                type="text"
                placeholder="20158 E Mesa Verde Rd, Mayer, AZ 86333"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isAnalyzing}
                className={`${bubbleInput} flex-1`}
              />
              <button
                onClick={handleGeocode}
                disabled={isAnalyzing || !address}
                className="inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Geocode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lat"
                className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                Latitude
              </label>
              <input
                id="lat"
                type="number"
                step="0.0001"
                placeholder="34.5"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                disabled={isAnalyzing}
                className={bubbleInput}
              />
            </div>
            <div>
              <label
                htmlFor="lon"
                className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                Longitude
              </label>
              <input
                id="lon"
                type="number"
                step="0.0001"
                placeholder="-112.5"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                disabled={isAnalyzing}
                className={bubbleInput}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="daysBack"
              className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              Days to Look Back
            </label>
            <input
              id="daysBack"
              type="number"
              min="1"
              max="365"
              value={daysBack}
              onChange={(e) => setDaysBack(e.target.value)}
              disabled={isAnalyzing}
              className={bubbleInput}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Recommended: 90 days for hail/wind events
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !lat || !lon}
            className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:shadow-lg"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Weather Data...
              </>
            ) : (
              <>
                <Cloud className="mr-2 h-4 w-4" />
                Generate Weather Report
              </>
            )}
          </Button>
        </div>
      </div>

      {dol && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm dark:border-green-900/50 dark:bg-green-950/20">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-green-900 dark:text-green-100">
              <Calendar className="h-5 w-5" />
              Recommended Date of Loss
            </h3>
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {new Date(dol).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <p className="mt-2 text-sm text-green-800 dark:text-green-200">
            Based on weather events near this location
          </p>
        </div>
      )}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Summary Card */}
          <div className={`${bubbleCard} p-6`}>
            <div className="mb-2 flex items-center gap-2">
              <Cloud className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Events</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {summary.totalEvents}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Date Range</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {daysBack} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Location</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {address.split(",")[0] || "Custom"}
                </span>
              </div>
            </div>
          </div>

          {/* Hail Intelligence */}
          <div className={`${bubbleCard} p-6`}>
            <div className="mb-2 flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Hail Intel</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Reports</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {summary.hailEvents}
                </span>
              </div>
              {summary.maxHailSize && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Max Size</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {summary.maxHailSize}" diameter
                  </span>
                </div>
              )}
              <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 dark:bg-blue-950/30">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  {summary.hailEvents > 0 ? "Hail damage likely" : "No hail reports found"}
                </p>
              </div>
            </div>
          </div>

          {/* Wind Intelligence */}
          <div className={`${bubbleCard} p-6`}>
            <div className="mb-2 flex items-center gap-2">
              <Wind className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Wind Intel</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Reports</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {summary.windEvents}
                </span>
              </div>
              {summary.maxWindGust && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Max Gust</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {summary.maxWindGust} mph
                  </span>
                </div>
              )}
              <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  {summary.windEvents > 0 ? "Wind damage possible" : "No wind reports found"}
                </p>
              </div>
            </div>
          </div>

          {/* Data Source */}
          <div className={`${bubbleCard} p-6`}>
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Data Source</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Provider</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Iowa Mesonet
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Accuracy</span>
                <span className="font-medium text-green-600 dark:text-green-400">High</span>
              </div>
              <div className="mt-2 rounded-xl bg-green-50 px-3 py-2 dark:bg-green-950/30">
                <p className="text-xs text-green-800 dark:text-green-200">Real-time NOAA data</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className={`${bubbleCard} p-6`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Weather Events ({events.length})
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Significant weather events found in the timeframe
            </p>
          </div>
          <div>
            <div className="space-y-3">
              {events.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {event.type}
                        </span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                          {event.severity}
                        </span>
                      </div>
                      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <span>{event.distance.toFixed(1)} miles away</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
