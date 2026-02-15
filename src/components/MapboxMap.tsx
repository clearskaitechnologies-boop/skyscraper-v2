/**
 * MapboxMap stub component
 * Real implementation requires @mapbox-gl and react-map-gl
 */
"use client";

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
  className?: string;
  properties?: any[];
}

export default function MapboxMap({ className }: MapboxMapProps) {
  return (
    <div className={className || "h-[400px] w-full rounded-lg bg-muted"}>
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Map view requires Mapbox GL configuration
      </div>
    </div>
  );
}
