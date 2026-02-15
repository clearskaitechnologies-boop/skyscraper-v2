export type ImageQuality = "high" | "medium" | "low";
export type HeaderStyle = { showLogo?: boolean; showTitle?: boolean; showContact?: boolean };
export type WatermarkOpts = { text?: string; opacity?: number; diagonal?: boolean };

export type ExportBranding = {
  brandName?: string;
  logoUrl?: string;
  contactLine?: string;
};

export type ExportV3Options = {
  themeId?: string;
  sections?: string[];
  photoLayout?: "grid2" | "grid3" | "grid4";
  addToc?: boolean;
  pageNumbers?: boolean;
  outline?: boolean;
  branding?: ExportBranding;
  header?: HeaderStyle;
  footer?: { showPageNums?: boolean };
  images?: { quality?: ImageQuality; recompress?: boolean };
  watermark?: WatermarkOpts | null;
};

export function targetLongestEdge(quality: ImageQuality = "medium") {
  return quality === "high" ? 2200 : quality === "low" ? 1000 : 1600;
}
