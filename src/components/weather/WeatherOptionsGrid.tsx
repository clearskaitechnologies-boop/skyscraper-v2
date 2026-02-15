"use client";

import { WeatherWizardPayload } from "@/lib/weather/types";

interface WeatherOptionsGridProps {
  options: WeatherWizardPayload["options"];
  onChange: (options: WeatherWizardPayload["options"]) => void;
}

export function WeatherOptionsGrid({ options, onChange }: WeatherOptionsGridProps) {
  const toggleOption = (key: keyof WeatherWizardPayload["options"]) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  const weatherOptions = [
    { key: "hail" as const, label: "Hail Swath", icon: "🌩️", description: "NOAA hail data" },
    { key: "wind" as const, label: "Wind Gusts", icon: "🌬️", description: "NWS wind data" },
    { key: "rain" as const, label: "Rainfall", icon: "☔", description: "NCEI precipitation" },
    { key: "snow" as const, label: "Snow/Freeze", icon: "❄️", description: "NWS winter weather" },
    { key: "radar" as const, label: "Radar Summary", icon: "📍", description: "AI-synthesized radar" },
    { key: "stormEvents" as const, label: "Storm Events", icon: "⚡", description: "NOAA storm database" },
  ];

  const advancedOptions = [
    { key: "buildingCodeLoads" as const, label: "Building Code Loads", icon: "🏚️", description: "Wind/snow requirements" },
    { key: "cocorahs" as const, label: "CoCoRaHS Reports", icon: "🔍", description: "Neighbor observations" },
    { key: "satellite" as const, label: "Satellite Data", icon: "🛰️", description: "Precipitation imagery" },
    { key: "aiSeverityRating" as const, label: "AI Severity Rating", icon: "🧠", description: "Storm intensity 1-10" },
    { key: "lossTimeline" as const, label: "Loss Timeline", icon: "📝", description: "Chronological summary" },
  ];

  return (
    <div className="space-y-6">
      {/* Core Weather Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Core Weather Data</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {weatherOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => toggleOption(option.key)}
              className={`
                relative rounded-xl border-2 px-4 py-3 text-left transition-all
                ${
                  options[option.key]
                    ? "border-indigo-300 bg-indigo-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 text-2xl">{option.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
                </div>
                {options[option.key] && (
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Add-Ons */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Advanced Add-Ons</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {advancedOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => toggleOption(option.key)}
              className={`
                relative rounded-xl border-2 px-4 py-3 text-left transition-all
                ${
                  options[option.key]
                    ? "border-purple-300 bg-purple-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 text-2xl">{option.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{option.description}</div>
                </div>
                {options[option.key] && (
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-purple-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="text-xs text-gray-500">
        {Object.values(options).filter(Boolean).length} of {Object.keys(options).length} options selected
      </div>
    </div>
  );
}
