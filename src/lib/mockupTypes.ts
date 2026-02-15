export type MockupSpec = {
  reportId: string;
  address?: string;
  lat?: number;
  lon?: number;
  colorway?: string;
  systemType?: "Shingle" | "Tile" | "Metal";
  angles?: Array<"front" | "left" | "right" | "top">;
  pitchHint?: "low" | "medium" | "steep";
};

export type MockupResult = {
  id: string;
  images: { angle: string; url: string; colorway: string }[];
  mapPinUrl?: string;
  created_at: string;
};

export const COLORWAYS = [
  "Charcoal",
  "Weathered Wood",
  "Pewter",
  "Desert Sand",
  "Slate",
  "Forest",
  "Terracotta",
];

export const ANGLES = ["front", "left", "right", "top"] as const;
