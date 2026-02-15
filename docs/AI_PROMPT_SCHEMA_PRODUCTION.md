# AI PROMPT SCHEMA - PRODUCTION SPECIFICATION

## Executive Summary

This document defines the **exact prompt structure** for the Dashboard AI Assistant in production. Each AI action follows a consistent schema that ensures high-quality, contextual outputs.

---

## Core Prompt Architecture

### 1. System Role (Fixed)

```typescript
const SYSTEM_ROLE = `You are a professional insurance claim assistant specializing in property damage claims. You provide accurate, detailed, and professional documentation for insurance adjusters, contractors, and policyholders.

Your outputs must be:
- Factual and evidence-based
- Professionally formatted
- Compliant with insurance industry standards
- Detailed but concise
- Ready for submission to insurance carriers`;
```

### 2. Context Injection Pattern

Every AI request includes structured context:

```typescript
interface ClaimContext {
  // Basic Info
  claimNumber: string;
  insuredName: string;
  propertyAddress: string;
  dateOfLoss: string;

  // Insurance Details
  carrier: string;
  policyNumber: string;
  adjusterName?: string;
  adjusterEmail?: string;
  adjusterPhone?: string;

  // Damage Info
  claimType: string; // "Storm Damage", "Fire", "Water", etc.
  damageType?: string; // "HAIL", "WIND", "FIRE", etc.
  status: string;

  // Financial (if available)
  rcvEstimate?: number;
  acvEstimate?: number;
  deductible?: number;

  // Supporting Data
  photos?: PhotoMetadata[];
  documents?: DocumentMetadata[];
  inspectionNotes?: string;
  priorCommunications?: CommunicationLog[];
}
```

---

## Action-Specific Prompt Templates

### 1. WRITE SUPPLEMENT

**Purpose**: Generate supplement requests for additional damage

**Template**:

```typescript
const SUPPLEMENT_PROMPT = `
SYSTEM: ${SYSTEM_ROLE}

CONTEXT:
Claim: ${claimNumber}
Insured: ${insuredName}
Property: ${propertyAddress}
Original Estimate: $${rcvEstimate}
Carrier: ${carrier}
Adjuster: ${adjusterName}

TASK:
Generate a professional supplement request documenting additional damage discovered after the initial inspection.

USER INSTRUCTIONS:
${userPrompt}

REQUIRED SECTIONS:
1. Header (Claim info, property, date)
2. Additional Damage Items (itemized with locations)
3. Cost Breakdown (materials + labor per item)
4. Total Additional Amount
5. Justification (why not visible initially)
6. Supporting Documentation Reference

FORMAT:
- Professional business format
- Line items with unit costs
- Clear categorization (Roof, Interior, Exterior, etc.)
- Total summary at end

OUTPUT:
[Generate supplement request]
`;
```

**Example Output Structure**:

```
SUPPLEMENT REQUEST
Claim: ${claimNumber}
Date: ${currentDate}
Property: ${propertyAddress}

ADDITIONAL DAMAGE DISCOVERED:

ROOFING:
- Item: Damaged shingles (north slope)
  Quantity: 15 shingles
  Unit Cost: $25/ea
  Labor: $450
  Subtotal: $825

INTERIOR:
- Item: Ceiling drywall replacement
  Area: 80 SF
  Material: $160
  Labor: $320
  Subtotal: $480

TOTAL ADDITIONAL: $5,005

JUSTIFICATION:
This damage was not visible during initial inspection due to...
```

---

### 2. DEPRECIATION ANALYSIS

**Purpose**: Calculate depreciation schedules

**Template**:

```typescript
const DEPRECIATION_PROMPT = `
SYSTEM: ${SYSTEM_ROLE}

You are calculating depreciation for insurance claim components.

CONTEXT:
Claim: ${claimNumber}
Property: ${propertyAddress}
Property Age: ${propertyAge} years
Components: ${components}

TASK:
Calculate accurate depreciation for each damaged component based on:
- Component age
- Expected useful life
- Industry depreciation tables
- Carrier-specific depreciation policies

USER INSTRUCTIONS:
${userPrompt}

REQUIRED SECTIONS:
1. Component Inventory
2. Depreciation Methodology
3. Item-by-Item Breakdown (RCV, depreciation %, ACV)
4. Total Summary (RCV, Total Depreciation, ACV)
5. Recoverable Amount Note

DEPRECIATION RATES (Standard):
- Roofing (Asphalt Shingles): 5% per year, 20-year life
- Roofing (Metal): 2.5% per year, 40-year life
- Paint (Interior): 10% per year, 10-year life
- Paint (Exterior): 7% per year, 15-year life
- Drywall: 2.5% per year, 40-year life
- Flooring (Carpet): 10% per year, 10-year life
- Windows: 2% per year, 50-year life

OUTPUT:
[Generate depreciation analysis]
`;
```

---

### 3. ESTIMATE/SCOPE BUILDER

**Purpose**: Create detailed repair estimates

**Template**:

```typescript
const ESTIMATE_PROMPT = `
SYSTEM: ${SYSTEM_ROLE}

You are creating a detailed contractor estimate for property repairs.

CONTEXT:
Claim: ${claimNumber}
Property: ${propertyAddress}
Damage Type: ${damageType}
Inspection Date: ${inspectionDate}
Photos: ${photoCount} available

TASK:
Generate a professional, itemized estimate with:
- Scope of work (detailed description)
- Materials list with quantities and unit costs
- Labor hours and rates
- Equipment/disposal costs
- Tax calculations
- Timeline estimate

USER INSTRUCTIONS:
${userPrompt}

REQUIRED SECTIONS:
1. Project Overview
2. Scope of Work (by area/category)
3. Materials Breakdown
4. Labor Breakdown
5. Subtotals by Category
6. Tax & Totals
7. Timeline & Warranty Info

COST GUIDANCE (Regional: ${region}):
- Labor Rate: $${laborRate}/hour
- Material markup: ${materialMarkup}%
- Disposal fees: Typically $${disposalFee} per ton
- Sales tax: ${taxRate}%

OUTPUT:
[Generate detailed estimate]
`;
```

---

### 4. REPORT/REBUTTAL

**Purpose**: Generate comprehensive claim reports or rebuttals

**Template**:

```typescript
const REPORT_PROMPT = `
SYSTEM: ${SYSTEM_ROLE}

You are preparing a ${reportType} for submission to the insurance carrier.

CONTEXT:
Claim: ${claimNumber}
Insured: ${insuredName}
Property: ${propertyAddress}
Carrier: ${carrier}
Adjuster: ${adjusterName}
Current Status: ${status}

AVAILABLE DATA:
- Photos: ${photoCount}
- Documents: ${documentCount}
- Inspection Notes: ${hasInspectionNotes ? "Yes" : "No"}
- Weather Data: ${hasWeatherData ? "Verified" : "Not verified"}

TASK:
${
  reportType === "report"
    ? "Generate a comprehensive claim documentation report"
    : "Generate a professional rebuttal to the carrier's initial determination"
}

USER INSTRUCTIONS:
${userPrompt}

REQUIRED SECTIONS (Report):
1. Executive Summary
2. Property Information
3. Loss Event Details
4. Damage Assessment (by category)
5. Documentation Summary
6. Recommendations
7. Next Steps

REQUIRED SECTIONS (Rebuttal):
1. Subject Line (Re: Claim ${claimNumber})
2. Initial Determination Summary
3. Points of Disagreement (itemized)
4. Supporting Evidence (reference photos/docs)
5. Corrected Scope of Work
6. Revised Estimate
7. Request for Reconsideration

TONE:
${
  reportType === "report"
    ? "Professional, factual, objective"
    : "Professional, assertive but respectful, evidence-based"
}

OUTPUT:
[Generate ${reportType}]
`;
```

---

## API Integration Pattern

### OpenAI Implementation

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAIOutput(
  action: AIAction,
  claimContext: ClaimContext,
  userInstructions: string
): Promise<string> {
  // Select template
  const promptTemplate = getPromptTemplate(action);

  // Inject context
  const systemPrompt = interpolateTemplate(promptTemplate.system, claimContext);
  const userPrompt = interpolateTemplate(promptTemplate.user, {
    ...claimContext,
    userInstructions,
  });

  // Call API
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3, // Low temp for consistency
    max_tokens: 2000,
  });

  return response.choices[0].message.content || "";
}
```

### Claude Implementation

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateAIOutput(
  action: AIAction,
  claimContext: ClaimContext,
  userInstructions: string
): Promise<string> {
  const promptTemplate = getPromptTemplate(action);
  const systemPrompt = interpolateTemplate(promptTemplate.system, claimContext);
  const userPrompt = interpolateTemplate(promptTemplate.user, {
    ...claimContext,
    userInstructions,
  });

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    temperature: 0.3,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content[0].text;
}
```

---

## Context Enhancement

### Photo Analysis Integration

When photos are available, include vision analysis:

```typescript
// Step 1: Analyze photos with GPT-4 Vision
const photoAnalysis = await openai.chat.completions.create({
  model: "gpt-4-vision-preview",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this property damage photo. Describe damage type, severity, and affected components.",
        },
        { type: "image_url", image_url: { url: photoUrl } },
      ],
    },
  ],
});

// Step 2: Inject analysis into main prompt
claimContext.inspectionNotes += `\n\nPhoto Analysis:\n${photoAnalysis.choices[0].message.content}`;
```

### Weather Data Integration

```typescript
// Fetch weather verification
const weatherData = await fetch(
  `/api/weather/historical?date=${dateOfLoss}&location=${propertyAddress}`
);
const weather = await weatherData.json();

// Add to context
claimContext.weatherVerification = {
  date: dateOfLoss,
  conditions: weather.conditions,
  windSpeed: weather.windSpeedMph,
  hailSize: weather.hailSizeInches,
  precipitationInches: weather.precipitation,
  verified: weather.source === "noaa",
};
```

---

## Quality Assurance

### Output Validation

```typescript
interface AIOutputValidation {
  hasRequiredSections: boolean;
  lengthAppropriate: boolean;
  containsClaimNumber: boolean;
  containsPropertyAddress: boolean;
  professionalTone: boolean;
  errors: string[];
}

function validateOutput(output: string, action: AIAction): AIOutputValidation {
  const requiredSections = REQUIRED_SECTIONS[action];
  const validation = {
    hasRequiredSections: requiredSections.every((section) =>
      output.toLowerCase().includes(section.toLowerCase())
    ),
    lengthAppropriate: output.length > 500 && output.length < 5000,
    containsClaimNumber: /CLM-|CLAIM|DEMO-/.test(output),
    containsPropertyAddress: output.includes(claimContext.propertyAddress),
    professionalTone: !hasCasualLanguage(output),
    errors: [],
  };

  if (!validation.hasRequiredSections) {
    validation.errors.push("Missing required sections");
  }

  return validation;
}
```

---

## Cost Optimization

### Token Management

- **Average tokens per action**:
  - Supplement: 1,500 tokens
  - Depreciation: 1,200 tokens
  - Estimate: 2,000 tokens
  - Report: 2,500 tokens

- **Cost per request** (GPT-4 Turbo):
  - Input: ~$0.02
  - Output: ~$0.05
  - **Total: ~$0.07 per AI action**

### Caching Strategy

```typescript
// Cache generated outputs for 24 hours
const cacheKey = `ai:${action}:${claimId}:${hash(userInstructions)}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const output = await generateAIOutput(...);
await redis.setex(cacheKey, 86400, JSON.stringify(output));
```

---

## Usage Analytics

Track AI usage for billing/analytics:

```typescript
await prisma.ai_usage_log.create({
  data: {
    orgId,
    userId,
    claimId,
    action,
    tokensUsed: response.usage.total_tokens,
    cost: calculateCost(response.usage),
    success: true,
    createdAt: new Date(),
  },
});
```

---

## Security Considerations

1. **Rate Limiting**: 10 requests per user per hour
2. **Input Sanitization**: Strip HTML, validate claim ownership
3. **Output Filtering**: Remove any PII not already in context
4. **Audit Logging**: Log all AI generations with user/claim/timestamp

---

## Implementation Checklist

- [ ] Replace mock responses in `/src/app/api/ai/dashboard-assistant/route.ts`
- [ ] Add OpenAI or Anthropic client
- [ ] Implement prompt templates for each action
- [ ] Add context enrichment (photos, weather)
- [ ] Implement output validation
- [ ] Add caching layer
- [ ] Set up usage analytics
- [ ] Configure rate limiting
- [ ] Test each action with real claims
- [ ] Document token costs for billing

---

**Status**: Ready for production implementation
**Estimated Integration Time**: 4-6 hours
**Cost per 100 AI actions**: ~$7.00 (GPT-4 Turbo)
