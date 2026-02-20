import type { PremiumMergeData } from "@/lib/templates/buildMergeData";
import { getTemplateRequiredPlaceholders } from "@/lib/templates/placeholders";

export type TemplateAutofillPlan = {
  slug: string;
  fillableSections: Array<
    | "cover"
    | "header"
    | "executiveSummary"
    | "details"
    | "weather"
    | "findings"
    | "photos"
    | "scope"
    | "recommendations"
    | "signature"
  >;
  missingFields: string[];
  photoRecommendations: {
    primary: Array<{ url: string; caption: string; category: string }>;
  };
};

function hasNonEmpty(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function getAtPath(obj: any, path: string): unknown {
  const normalized = path.replace(/\[\]/g, "");
  const parts = normalized.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function buildTemplateAutofillPlan(options: {
  slug: string;
  data: PremiumMergeData;
}): TemplateAutofillPlan {
  const requiredPaths = getTemplateRequiredPlaceholders(options.slug);
  const missing = requiredPaths.filter((p) => !hasNonEmpty(getAtPath(options.data, p)));

  const fillable: TemplateAutofillPlan["fillableSections"] = [];

  if (hasNonEmpty(options.data.meta?.title)) fillable.push("cover");
  if (hasNonEmpty(options.data.org?.name) || hasNonEmpty(options.data.employee?.fullName)) {
    fillable.push("header");
  }
  fillable.push("details");

  if (hasNonEmpty(options.data.weather?.stormDate) || hasNonEmpty(options.data.weather?.reportId)) {
    fillable.push("weather");
  }
  if (options.data.findings?.length) fillable.push("findings");
  if (options.data.photos?.length) fillable.push("photos");
  if (options.data.scopeItems?.length) fillable.push("scope");
  fillable.push("recommendations", "signature");

  // Deterministic photo selection: prioritize labeled categories first.
  const preferred = ["overview", "exterior", "roof", "interior", "damage", "other"];
  const sortedPhotos = [...(options.data.photos || [])].sort((a, b) => {
    const ai = preferred.indexOf((a.category || "").toLowerCase());
    const bi = preferred.indexOf((b.category || "").toLowerCase());
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return {
    slug: options.slug,
    fillableSections: Array.from(new Set(fillable)),
    missingFields: missing,
    photoRecommendations: {
      primary: sortedPhotos.slice(0, 12).map((p) => ({
        url: p.url,
        caption: p.caption,
        category: p.category,
      })),
    },
  };
}
