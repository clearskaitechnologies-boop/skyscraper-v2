// components/weather/WeatherToggleGrid.tsx
import React from "react";

import { weatherToggleList } from "@/lib/weather/weather-schema";

export default function WeatherToggleGrid({
  toggles,
  onToggle,
}: {
  toggles: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {weatherToggleList.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => onToggle(key, !toggles[key])}
          className={`flex items-center space-x-3 rounded border p-4 
            ${toggles[key] ? "bg-blue-600 text-white" : "bg-white"}
          `}
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
