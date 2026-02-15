/**
 * Report layout presets and types
 * Claims-first: default is Claims – Standard
 */

export type SectionKey =
  | "cover"
  | "summary"
  | "storm"
  | "codes"
  | "photos"
  | "supplements"
  | "pricing"
  | "signatures"
  | "mockups";

export type LayoutPreset = {
  id: string;
  name: string;
  sections: SectionKey[];
  photoLayout: 2 | 3 | 4;
  options?: {
    showOverlays?: boolean;
    citations?: boolean;
  };
};

export const BUILTIN_LAYOUTS: LayoutPreset[] = [
  {
    id: "claims_standard",
    name: "Claims – Standard",
    sections: ["cover", "summary", "storm", "codes", "photos", "supplements", "signatures"],
    photoLayout: 3,
    options: { showOverlays: true, citations: true },
  },
  {
    id: "retail_sales",
    name: "Retail – Sales",
    sections: ["cover", "mockups", "pricing", "photos", "signatures"],
    photoLayout: 4,
    options: { showOverlays: false, citations: false },
  },
  {
    id: "inspection_lite",
    name: "Inspection – Lite",
    sections: ["cover", "summary", "photos", "signatures"],
    photoLayout: 3,
    options: { showOverlays: false, citations: false },
  },
];
