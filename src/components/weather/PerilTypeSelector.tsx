"use client";

import { PERIL_CONFIG,PerilType } from "@/lib/weather/types";

interface PerilTypeSelectorProps {
  selected: PerilType;
  onChange: (peril: PerilType) => void;
  showAutoDetect?: boolean;
}

export function PerilTypeSelector({
  selected,
  onChange,
  showAutoDetect = true,
}: PerilTypeSelectorProps) {
  const perils: PerilType[] = showAutoDetect
    ? ["HAIL", "WIND", "RAIN", "FLOOD", "SNOW", "AUTO_DETECT"]
    : ["HAIL", "WIND", "RAIN", "FLOOD", "SNOW"];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Type of Peril
      </label>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {perils.map((peril) => {
          const config = PERIL_CONFIG[peril];
          const isSelected = selected === peril;
          
          return (
            <button
              key={peril}
              type="button"
              onClick={() => onChange(peril)}
              className={`
                relative rounded-xl border-2 px-4 py-3 transition-all
                ${
                  isSelected
                    ? `${config.color} border-current shadow-md`
                    : "border-gray-200 bg-white hover:border-gray-300"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.icon}</span>
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              {isSelected && (
                <div className="absolute right-2 top-2">
                  <svg
                    className="h-5 w-5"
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
            </button>
          );
        })}
      </div>
      {selected === "AUTO_DETECT" && (
        <p className="mt-2 text-xs text-muted-foreground">
          🤖 AI will analyze photos and claim data to determine the peril type automatically
        </p>
      )}
    </div>
  );
}
