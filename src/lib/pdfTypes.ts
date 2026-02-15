export type PriceLine = {
  item: string;
  qty: number;
  unit: string;
  unitPrice: number;
  taxable?: boolean;
  notes?: string;
};

export type PriceTable = {
  title?: string;
  lines: PriceLine[];
  taxRate?: number;
  discount?: number;
};

export type CodeCallout = {
  code: string;
  section: string;
  text: string;
};

export type SectionKey =
  | "cover"
  | "summary"
  | "photos"
  | "materials"
  | "warranties"
  | "timeline"
  | "prices"
  | "code"
  | "signatures";

export type PhotoLayout = "grid2" | "grid3" | "grid4";

export type ExportOptionsV2 = {
  themeId?: string;
  watermark?: "draft" | "confidential" | "client-review" | null;
  sections?: SectionKey[];
  photoLayout?: PhotoLayout;
  addToc?: boolean;
  pageNumbers?: boolean;
  outline?: boolean;
  meta?: Record<string, string>;
};
