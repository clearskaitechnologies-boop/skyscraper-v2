"use client";

import { Map } from "react-map-gl/mapbox";

export default function MapView() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-100">
        <p className="text-gray-500">MapBox token not configured</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border">
      <Map
        initialViewState={{
          longitude: -112.453,
          latitude: 34.75,
          zoom: 10,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxToken}
      />
    </div>
  );
}
