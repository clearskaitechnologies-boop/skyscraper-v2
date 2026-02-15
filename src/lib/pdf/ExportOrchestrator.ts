import structure from "@/config/skai-structure.json";
import { resolveBranding } from "@/lib/branding/resolveBranding";
import { renderLandscapePDFStub } from "@/lib/pdf/renderLandscapeStub";
import { AddonKey,AddonRegistry, normalizeAddons } from "@/lib/registry/AddonRegistry";
import { AIEngineRegistry } from "@/lib/registry/AIEngineRegistry";
import { composeSections, SectionKey,SectionRegistry } from "@/lib/registry/SectionRegistry";

type BuildInput = {
  reportType: keyof (typeof structure)["reports"];
  plan?: keyof (typeof structure)["plans"];
  addons?: AddonKey[];
  ctx: any; // lead/job/org/photos/etc
  orgBranding?: any;
};

export type BuildResult = {
  sections: SectionKey[];
  ai: Record<string, any>;
  ctx: any;
};

export async function buildDocument(input: BuildInput): Promise<BuildResult> {
  const cfg = (structure as any).reports[input.reportType];
  if (!cfg) throw new Error(`Unknown reportType: ${input.reportType}`);

  // resolve branding
  const branding = resolveBranding(input.orgBranding || null, (structure as any).branding.fallback);
  const ctx0 = { ...input.ctx, branding, reportType: input.reportType };

  // addons
  const addonKeys = normalizeAddons(input.addons || cfg.addons || []);
  let ctx = { ...ctx0, addons: addonKeys };
  for (const k of addonKeys) {
    const a = AddonRegistry[k as AddonKey];
    if (!a) continue;
    ctx = await a.apply(ctx);
  }

  // compose sections
  const baseSections = (cfg.sections as SectionKey[]) || [];
  const sections = composeSections(baseSections, ctx);

  // AI modules
  const aiResults: Record<string, any> = {};
  const aiKeys = (cfg.ai as string[]) || [];
  for (const k of aiKeys) {
    const mod = (AIEngineRegistry as any)[k];
    if (!mod) continue;
    const should = !!mod.trigger?.(ctx);
    if (should) {
      aiResults[k] = await mod.run(ctx);
    }
  }

  return { sections, ai: aiResults, ctx };
}

// Delegates to a renderer (pdf-lib/react-pdf, etc.)
export async function exportPDF(build: BuildResult): Promise<Uint8Array> {
  return await renderLandscapePDFStub(build as any);
}
