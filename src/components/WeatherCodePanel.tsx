import React from "react";

type Violation = {
  code: string;
  title: string;
  description: string;
  value: number;
};

// This component expects violations to be passed as props
// Remove hardcoded mock data
export default function WeatherCodePanel({ violations = [] }: { violations?: Violation[] }) {
  return (
    <div className="grid min-h-[520px] grid-cols-2 gap-6 p-6">
      {/* Left: NOAA radar + DOL info */}
      <div className="flex flex-col gap-4 rounded-lg bg-black/60 p-4">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div>
            <div className="text-xs uppercase tracking-wide">Date of Loss</div>
            <div className="text-base font-semibold">2025-10-18 • 14:23 MST</div>
          </div>
          <div className="text-right">
            <div className="text-xs">Peril Match</div>
            <div className="text-base font-semibold text-blue-300">Hail • 1.25”</div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden rounded border border-neutral-800">
          {/* NOAA radar placeholder image (real overlay in production) */}
          <img
            src="https://mesonet.agron.iastate.edu/archive/data/radar/2025/10/18/reflectivity_sm/20251018_1423_Z_radar.png"
            alt="NOAA radar"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>Map pin verified • 0.8 km from station</div>
          <div>
            Integrity Score: <span className="font-semibold text-blue-300">92%</span>
          </div>
        </div>
      </div>

      {/* Right: Code citations + Add-to-scope */}
      <div className="flex flex-col gap-4 rounded-lg bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Local Code & Violations Found</h3>
            <p className="text-sm text-gray-400">
              Code citations matched to observed damage • Add items to scope with one click.
            </p>
          </div>
          <div className="text-sm font-medium text-yellow-300">Approval Confidence • 88%</div>
        </div>

        <div className="flex-1 space-y-3 overflow-auto">
          {violations.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <p>No violations found. Upload data to analyze.</p>
            </div>
          ) : (
            violations.map((v) => (
              <div
                key={v.code}
                className="flex items-start justify-between gap-4 rounded bg-neutral-800 p-3"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {v.code} — {v.title}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{v.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-gold text-sm font-semibold">${v.value}</div>
                  <button className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white">
                    Add to Scope
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>Powered by ClearSKai™</div>
          <div className="text-xs text-gray-500">Made in Arizona • Raven</div>
        </div>
      </div>
    </div>
  );
}
