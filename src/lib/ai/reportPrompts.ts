/**
 * AI Report Generation Prompts
 * Version: 1.0.0
 *
 * Deterministic prompt templates for generating report sections.
 * Uses temperature=0.3 for consistent output across identical inputs.
 */

import { getSectionByKey } from "@/lib/reports/templateSections";

export interface ReportGenerationContext {
  // Claim data
  claimId: string;
  claimNumber?: string;
  propertyAddress: string;
  dateOfLoss: Date;
  lossType: string;

  // Policy info
  carrier?: string;
  policyNumber?: string;
  insured_name?: string;
  adjusterName?: string;

  // Damage data
  damageAreas?: Array<{
    area: string;
    severity: string;
    description: string;
  }>;

  // Photos
  photos?: Array<{
    url: string;
    caption?: string;
    category?: string;
  }>;

  // Scope/pricing
  lineItems?: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;

  // Weather data
  weatherData?: {
    date: string;
    conditions: string;
    windSpeed?: number;
    precipitation?: number;
  };

  // Test cuts
  testCuts?: Array<{
    location: string;
    finding: string;
    moistureLevel?: number;
  }>;

  // Organization branding
  orgName: string;
  orgLogo?: string;

  // Template-specific
  templateType?: "INSURANCE_FRIENDLY" | "CONTRACTOR_ADVOCACY";
}

/**
 * System prompt for report generation
 */
export const REPORT_GENERATION_SYSTEM_PROMPT = `You are an expert insurance claims report writer specializing in property damage assessments. Your reports are:
- Factual, precise, and evidence-based
- Compliant with insurance industry standards
- Well-structured with clear sections
- Professional in tone and formatting
- Supported by photographic evidence and measurements

You generate content in valid JSON format with structured fields. Never include conversational text outside the JSON response.`;

/**
 * Cover page generation prompt
 */
export function getCoverPagePrompt(context: ReportGenerationContext, variant: string): string {
  const section = getSectionByKey("cover");
  if (!section) throw new Error("Cover section not found");

  const basePrompt = `Generate a professional cover page for a property damage claim report.

Context:
- Property: ${context.propertyAddress}
- Claim: ${context.claimNumber || "N/A"}
- Date of Loss: ${context.dateOfLoss.toLocaleDateString()}
- Loss Type: ${context.lossType}
- Insured: ${context.insured_name || "N/A"}
- Organization: ${context.orgName}

Layout Variant: ${variant}

Return JSON with:
{
  "title": "Main report title",
  "subtitle": "Subtitle or claim identifier",
  "propertyInfo": {
    "address": "Full address",
    "lossDate": "Formatted date",
    "lossType": "Type of loss"
  },
  "metadata": {
    "preparedFor": "Insurance carrier or client",
    "preparedBy": "Organization name",
    "reportDate": "Current date",
    "claimNumber": "Claim identifier"
  }
}`;

  return basePrompt;
}

/**
 * Executive summary generation prompt
 */
export function getExecutiveSummaryPrompt(
  context: ReportGenerationContext,
  variant: string,
  aiInstructions?: string
): string {
  const section = getSectionByKey("executive-summary");
  if (!section) throw new Error("Executive summary section not found");

  const tone =
    variant === "advocacy-ai"
      ? "advocate for comprehensive repair coverage"
      : "remain neutral and factual";

  const basePrompt = `Generate an executive summary for a property damage claim report.

Context:
- Property: ${context.propertyAddress}
- Loss Type: ${context.lossType}
- Date of Loss: ${context.dateOfLoss.toLocaleDateString()}
- Damage Areas: ${context.damageAreas?.length || 0} identified
- Total Line Items: ${context.lineItems?.length || 0}

Tone: ${tone}
AI Instructions: ${aiInstructions || section.aiRole}

Return JSON with:
{
  "summary": "2-3 paragraph executive summary",
  "keyFindings": [
    "Finding 1",
    "Finding 2",
    "Finding 3"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "totalEstimate": "Estimated repair cost (if available)"
}`;

  return basePrompt;
}

/**
 * Weather verification generation prompt
 */
export function getWeatherVerificationPrompt(
  context: ReportGenerationContext,
  variant: string
): string {
  const section = getSectionByKey("weather-verification");
  if (!section) throw new Error("Weather verification section not found");

  const basePrompt = `Generate weather verification section for a claim report.

Context:
- Date of Loss: ${context.dateOfLoss.toLocaleDateString()}
- Loss Type: ${context.lossType}
- Weather Data: ${context.weatherData ? JSON.stringify(context.weatherData) : "Not provided"}

Variant: ${variant === "noaa-integration" ? "Use NOAA data format" : "Manual entry format"}

Return JSON with:
{
  "verificationSource": "NOAA or Manual",
  "lossDate": "Date",
  "conditions": "Weather conditions description",
  "windSpeed": "Wind speed if applicable",
  "precipitation": "Precipitation if applicable",
  "analysis": "Brief analysis connecting weather to claimed damage",
  "supportsClaim": true/false
}`;

  return basePrompt;
}

/**
 * Photo evidence generation prompt (for captions/organization)
 */
export function getPhotoEvidencePrompt(context: ReportGenerationContext, variant: string): string {
  const section = getSectionByKey("photo-evidence");
  if (!section) throw new Error("Photo evidence section not found");

  const layout =
    variant === "room-by-room"
      ? "organized by room"
      : variant === "grid-labeled"
        ? "grid with labels"
        : "comparison slider";

  const basePrompt = `Generate photo evidence section organization for a claim report.

Context:
- Total Photos: ${context.photos?.length || 0}
- Layout: ${layout}

Return JSON with:
{
  "sections": [
    {
      "title": "Section title (e.g., 'Roof Damage' or 'Living Room')",
      "photos": [
        {
          "id": "Photo identifier",
          "caption": "Descriptive caption",
          "notes": "Additional observations"
        }
      ]
    }
  ],
  "summary": "Brief summary of photographic evidence"
}`;

  return basePrompt;
}

/**
 * Scope matrix generation prompt
 */
export function getScopeMatrixPrompt(
  context: ReportGenerationContext,
  variant: string,
  aiInstructions?: string
): string {
  const section = getSectionByKey("scope-matrix");
  if (!section) throw new Error("Scope matrix section not found");

  const style =
    variant === "repair-vs-replace"
      ? "Show repair vs. replacement analysis"
      : "Use Xactimate-style formatting";

  const basePrompt = `Generate scope of work matrix for a claim report.

Context:
- Line Items: ${context.lineItems?.length || 0}
- Style: ${style}
- AI Instructions: ${aiInstructions || section.aiRole}

Line Items Data:
${JSON.stringify(context.lineItems?.slice(0, 10) || [], null, 2)}

Return JSON with:
{
  "categories": [
    {
      "name": "Category name (e.g., 'Roofing', 'Interior')",
      "items": [
        {
          "description": "Work description",
          "quantity": "Quantity",
          "unit": "Unit of measure",
          "unitPrice": "Price per unit",
          "total": "Total cost",
          "notes": "Additional notes or justification"
        }
      ],
      "subtotal": "Category subtotal"
    }
  ],
  "summary": {
    "subtotal": "Sum of all categories",
    "tax": "Tax amount",
    "total": "Grand total"
  }
}`;

  return basePrompt;
}

/**
 * Code compliance generation prompt
 */
export function getCodeCompliancePrompt(context: ReportGenerationContext, variant: string): string {
  const section = getSectionByKey("code-compliance");
  if (!section) throw new Error("Code compliance section not found");

  const focus =
    variant === "manufacturer-first" ? "manufacturer specifications" : "jurisdiction codes";

  const basePrompt = `Generate code compliance section for a claim report.

Context:
- Property: ${context.propertyAddress}
- Loss Type: ${context.lossType}
- Focus: ${focus}

Return JSON with:
{
  "applicableCodes": [
    {
      "code": "Code identifier (e.g., 'IRC 2018', 'Manufacturer Spec XYZ')",
      "description": "What it requires",
      "applicability": "How it applies to this claim"
    }
  ],
  "complianceNotes": "Overall compliance considerations",
  "upgradeRequirements": [
    "Upgrade requirement 1",
    "Upgrade requirement 2"
  ]
}`;

  return basePrompt;
}

/**
 * Supplements generation prompt
 */
export function getSupplementsPrompt(context: ReportGenerationContext, variant: string): string {
  const section = getSectionByKey("supplements");
  if (!section) throw new Error("Supplements section not found");

  const style = variant === "timeline" ? "chronological timeline format" : "delta-only comparison";

  const basePrompt = `Generate supplements section for a claim report.

Context:
- Style: ${style}

Return JSON with:
{
  "supplements": [
    {
      "date": "Supplement date",
      "reason": "Reason for supplement",
      "items": [
        {
          "description": "New or revised item",
          "originalAmount": "Original estimate (if applicable)",
          "revisedAmount": "New amount",
          "justification": "Why this change is needed"
        }
      ],
      "supplementTotal": "Total for this supplement"
    }
  ],
  "summary": "Overall supplement summary"
}`;

  return basePrompt;
}

/**
 * Generic section prompt generator
 */
export function getSectionPrompt(
  sectionKey: string,
  context: ReportGenerationContext,
  variant: string,
  aiInstructions?: string
): string {
  switch (sectionKey) {
    case "cover":
      return getCoverPagePrompt(context, variant);
    case "executive-summary":
      return getExecutiveSummaryPrompt(context, variant, aiInstructions);
    case "weather-verification":
      return getWeatherVerificationPrompt(context, variant);
    case "photo-evidence":
      return getPhotoEvidencePrompt(context, variant);
    case "scope-matrix":
      return getScopeMatrixPrompt(context, variant, aiInstructions);
    case "code-compliance":
      return getCodeCompliancePrompt(context, variant);
    case "supplements":
      return getSupplementsPrompt(context, variant);

    // Default prompt for sections without specific templates
    default:
      const section = getSectionByKey(sectionKey);
      if (!section) throw new Error(`Section not found: ${sectionKey}`);

      return `Generate content for the "${section.defaultTitle}" section of a property damage claim report.

Context:
${JSON.stringify(context, null, 2)}

Layout Variant: ${variant}
AI Instructions: ${aiInstructions || section.aiRole}

Return structured JSON appropriate for this section type.`;
  }
}

/**
 * Max tokens per section type
 */
export const MAX_TOKENS_BY_SECTION: Record<string, number> = {
  cover: 500,
  toc: 300,
  "executive-summary": 1000,
  "weather-verification": 600,
  "adjuster-notes": 800,
  "photo-evidence": 1200,
  "test-cuts": 800,
  "scope-matrix": 2000,
  "code-compliance": 1000,
  "pricing-comparison": 800,
  supplements: 1000,
  "signature-page": 400,
  "attachments-index": 500,
};

/**
 * Get max tokens for a section
 */
export function getMaxTokensForSection(sectionKey: string): number {
  return MAX_TOKENS_BY_SECTION[sectionKey] || 800;
}
