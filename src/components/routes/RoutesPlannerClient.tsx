"use client";

import { useState } from "react";

type Stop = {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  type: "job" | "lead" | "office";
  eta?: string;
  status?: string;
};

type RoutesPlannerClientProps = {
  initialStops: Stop[];
  totalDistance: string;
  totalTime: string;
};

export function RoutesPlannerClient({
  initialStops,
  totalDistance,
  totalTime,
}: RoutesPlannerClientProps) {
  const [stops] = useState<Stop[]>(initialStops);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-4xl font-bold text-transparent">
            Route Planner – Live Production
          </h1>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Optimize your daily job routes with AI-powered route optimization • {stops.length} stops loaded
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Route Builder */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold text-[color:var(--text)]">
                Build Route
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--muted)]">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Enter starting address..."
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[color:var(--muted)]">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter ending address..."
                    className="focus:ring-[var(--primary)]/20 w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-2"
                  />
                </div>

                <button className="w-full rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-4 py-3 text-sm font-medium text-white shadow-[var(--glow)] transition hover:scale-[1.02]">
                  Optimize Route
                </button>
              </div>

              {/* Route Summary */}
              <div className="mt-6 space-y-3 border-t border-[color:var(--border)] pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--muted)]">Total Distance</span>
                  <span className="font-medium text-[color:var(--text)]">
                    {totalDistance}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--muted)]">Estimated Time</span>
                  <span className="font-medium text-[color:var(--text)]">
                    {totalTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--muted)]">Stops</span>
                  <span className="font-medium text-[color:var(--text)]">
                    {stops.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stops List */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--text)]">
                  Route Stops
                </h2>
                <button className="text-sm text-[color:var(--primary)] hover:underline">
                  + Add Stop
                </button>
              </div>

              <div className="space-y-3">
                {stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-4 transition hover:border-[color:var(--border-bright)]"
                  >
                    {/* Step Number */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-sm font-bold text-white">
                      {idx + 1}
                    </div>

                    {/* Stop Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[color:var(--text)]">
                          {stop.address}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            stop.type === "lead"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {stop.type}
                        </span>
                      </div>
                      {stop.eta && (
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          ETA: {stop.eta}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <button className="text-[color:var(--muted)] transition hover:text-[color:var(--text)]">
                      ⋮
                    </button>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {stops.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-sm text-[color:var(--muted)]">
                    No stops added yet
                  </p>
                  <button className="mt-3 text-sm text-[color:var(--primary)] hover:underline">
                    + Add your first stop
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
