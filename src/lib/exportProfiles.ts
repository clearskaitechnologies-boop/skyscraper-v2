export type SectionKey =
  | "cover"
  | "overview"
  | "code"
  | "mockup"
  | "timeline"
  | "pricing"
  | "materials"
  | "photos"
  | "weather"
  | "supplements"
  | "warranty"
  | "signature";

export type ExportProfileKey = "retail" | "insurance" | "comprehensive";

export type ExportProfile = {
  key: ExportProfileKey;
  label: string;
  include: SectionKey[];
  hide?: Partial<Record<SectionKey, string[]>>; // elements to hide within a section by data-key
  rename?: Partial<Record<SectionKey, string>>; // section title overrides
  order?: SectionKey[]; // explicit ordering if provided
};

export const BASE_ORDER: SectionKey[] = [
  "cover",
  "overview",
  "code",
  "mockup",
  "timeline",
  "pricing",
  "materials",
  "photos",
  "weather",
  "supplements",
  "warranty",
  "signature",
];

export const EXPORT_PROFILES: Record<ExportProfileKey, ExportProfile> = {
  retail: {
    key: "retail",
    label: "Retail Proposal",
    include: [
      "cover",
      "overview",
      "code",
      "mockup",
      "timeline",
      "pricing",
      "materials",
      "warranty",
      "signature",
    ],
    hide: {
      pricing: ["insurance-columns"],
      overview: ["insurance-language"],
    },
    rename: { pricing: "Price Breakdown" },
    order: BASE_ORDER,
  },
  insurance: {
    key: "insurance",
    label: "Insurance Packet",
    include: [
      "cover",
      "overview",
      "code",
      "timeline",
      "photos",
      "weather",
      "supplements",
      "warranty",
      "signature",
    ],
    hide: {
      pricing: ["retail-totals"],
      overview: ["retail-language"],
      materials: ["retail-only"],
      mockup: ["retail-only"],
    },
    rename: { pricing: "Scope & Unit Pricing" },
    order: [
      "cover",
      "overview",
      "weather",
      "photos",
      "code",
      "supplements",
      "timeline",
      "warranty",
      "signature",
      "pricing",
      "materials",
      "mockup",
    ],
  },
  comprehensive: {
    key: "comprehensive",
    label: "Comprehensive Report",
    include: [...BASE_ORDER],
    hide: {},
    order: BASE_ORDER,
  },
};

export function resolveSectionsForExport(
  profile: ExportProfileKey,
  selected: SectionKey[]
): SectionKey[] {
  const p = EXPORT_PROFILES[profile];
  const full = (p.order || BASE_ORDER).filter((k) => p.include.includes(k) && selected.includes(k));
  return Array.from(new Set(full));
}
