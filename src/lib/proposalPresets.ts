export type ProposalType = "retail" | "insurance" | "comprehensive";
export type SectionKey =
  | "cover"
  | "overview"
  | "code"
  | "mockup"
  | "timeline"
  | "pricing"
  | "materials"
  | "warranties"
  | "photos"
  | "weather"
  | "supplements"
  | "signature";

export const ALL_SECTIONS: Record<SectionKey, string> = {
  cover: "Cover Page",
  overview: "Overview of Damage",
  code: "Code & Compliance",
  mockup: "AI Restored Mockup",
  timeline: "Timeline",
  pricing: "Price Breakdown",
  materials: "Materials & Colors",
  warranties: "Warranties & Guarantees",
  photos: "Inspection Photos",
  weather: "Weather & Hail Report",
  supplements: "Supplement Requests",
  signature: "Client Signature & Next Steps",
};

export const PRESETS: Record<ProposalType, SectionKey[]> = {
  retail: [
    "cover",
    "overview",
    "mockup",
    "timeline",
    "pricing",
    "materials",
    "warranties",
    "photos",
    "signature",
  ],
  insurance: [
    "cover",
    "overview",
    "code",
    "weather",
    "photos",
    "supplements",
    "materials",
    "warranties",
    "signature",
  ],
  comprehensive: [
    "cover",
    "overview",
    "code",
    "mockup",
    "timeline",
    "pricing",
    "materials",
    "warranties",
    "photos",
    "weather",
    "supplements",
    "signature",
  ],
};

export const AUTOFILL_HINTS: Record<
  ProposalType,
  { overview: string; timeline?: string; code?: string; pricing?: string }
> = {
  retail: {
    overview:
      "Summarize roof condition in homeowner-friendly terms; emphasize aesthetics, longevity, and financing.",
    timeline: "Provide simple install timeline (permit → materials → install → clean-up).",
    pricing: "Present retail pricing with options (good/better/best) when data allows.",
  },
  insurance: {
    overview: "Summarize storm damage with observed impacts and functional impairment.",
    code: "List applicable code items for insurance scope (flashing, underlayment, drip edge).",
  },
  comprehensive: {
    overview: "Blend homeowner-friendly + technical detail for both sales and claim review.",
    code: "Include relevant code citations and brief purpose statements.",
    timeline: "Include permit lead time and contingencies.",
    pricing: "Include option sets and allowances when present.",
  },
};
