/**
 * Template Registry (Alternative Export)
 *
 * Re-export from templateRegistry for alternative import path
 */

import {
  getTemplateRequiredPlaceholders,
  listAllPlaceholderPaths,
  listPlaceholderPathsByGroup,
} from "@/lib/templates/placeholders";
import { ALL_TEMPLATES, type TemplateDefinition } from "@/lib/templates/templateRegistry";

export * from "./templateRegistry";

export interface PremiumTemplateRegistryEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  version: string;
  description: string;
  premium: true;
  placeholdersRequired: number;
  requiredPlaceholderPaths: string[];
  optionalPlaceholderPaths: string[];
  groups: Record<string, string[]>;
  assets: {
    previewPdf: string;
    thumbnail: string;
    templateHbs: string;
    stylesCss: string;
  };
}

export function getPremiumRegistry(): PremiumTemplateRegistryEntry[] {
  const allPaths = listAllPlaceholderPaths();
  const byGroup = listPlaceholderPathsByGroup();

  return ALL_TEMPLATES.map((t: TemplateDefinition) => {
    const required = getTemplateRequiredPlaceholders(t.slug, { category: t.category });
    const optional = allPaths.filter((p) => !required.includes(p));

    return {
      id: t.id,
      slug: t.slug,
      title: t.title,
      category: t.category,
      version: t.version,
      description: t.description,
      premium: true as const,
      placeholdersRequired: required.length,
      requiredPlaceholderPaths: required,
      optionalPlaceholderPaths: optional,
      groups: byGroup,
      assets: {
        previewPdf: `/templates/${t.slug}-premium/preview.pdf`,
        thumbnail: `/templates/${t.slug}-premium/thumbnail.png`,
        templateHbs: `/templates/${t.slug}-premium/template.hbs`,
        stylesCss: `/templates/${t.slug}-premium/styles.css`,
      },
    };
  });
}

export function getPremiumRegistryBySlug(slug: string): PremiumTemplateRegistryEntry | undefined {
  return getPremiumRegistry().find((t) => t.slug === slug);
}

export function getPremiumRegistryById(id: string): PremiumTemplateRegistryEntry | undefined {
  return getPremiumRegistry().find((t) => t.id === id);
}
