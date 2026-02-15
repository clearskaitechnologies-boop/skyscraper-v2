/**
 * Seed Business Rules
 *
 * Creates foundational rules for:
 * - Code compliance validation
 * - Carrier-specific patterns
 * - Quality checks
 * - Risk flags
 *
 * Run: npx ts-node prisma/seeds/seedRules.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedRules() {
  console.log("📋 Seeding Business Rules...");

  const rules = [
    {
      name: "EstimateRequiredBeforeSubmission",
      description: "Claims must have a complete estimate before submission to carrier",
      trigger: {
        all: [
          { path: "state", op: "==", value: "ESTIMATE_DRAFTED" },
          { path: "estimate.total", op: ">", value: 0 },
        ],
      },
      action: {
        type: "allow_transition",
        nextState: "SUBMITTED",
        priority: "critical",
      },
    },
    {
      name: "PhotoDocumentationRequired",
      description: "Minimum 5 photos required for quality claims",
      trigger: {
        any: [
          { path: "photos.length", op: "<", value: 5 },
          { path: "photos.annotated", op: "==", value: false },
        ],
      },
      action: {
        type: "flag",
        severity: "high",
        message: "Add more photos with annotations for better approval odds",
        suggestedAction: "schedule_photo_session",
      },
    },
    {
      name: "SteepSlopeRequiresUnderlayment",
      description: "Roof slopes >4:12 require underlayment replacement per IRC",
      trigger: {
        all: [
          { path: "roof.slope", op: ">", value: 4 },
          { path: "estimate.line_items", op: "not_contains", value: "underlayment" },
        ],
      },
      action: {
        type: "recommend",
        priority: "high",
        message: "Add underlayment - required by IRC Section R905.2",
        suggestedAction: "add_line_item",
        params: { item: "underlayment", code: "IRC R905.2" },
      },
    },
    {
      name: "StateFarmPrefersCodeCitations",
      description: "State Farm claims have 23% higher approval with code citations",
      trigger: {
        all: [
          { path: "carrier", op: "==", value: "State Farm" },
          { path: "narrative.codeCitations", op: "<", value: 2 },
        ],
      },
      action: {
        type: "recommend",
        priority: "medium",
        message: "Add building code citations - State Farm approves these 23% more often",
        suggestedAction: "add_code_citations",
      },
    },
    {
      name: "AllstateRequiresDetailedPhotos",
      description: "Allstate claims need minimum 8 annotated photos",
      trigger: {
        all: [
          { path: "carrier", op: "==", value: "Allstate" },
          { path: "photos.length", op: "<", value: 8 },
        ],
      },
      action: {
        type: "flag",
        severity: "medium",
        message: "Allstate typically requires 8+ annotated photos",
        suggestedAction: "add_photos",
      },
    },
    {
      name: "HailDamageRequiresTestSquares",
      description: "Hail damage claims benefit from test square documentation",
      trigger: {
        all: [
          { path: "damageType", op: "contains", value: "hail" },
          { path: "photos.testSquare", op: "==", value: false },
        ],
      },
      action: {
        type: "recommend",
        priority: "high",
        message: "Add test square photos - increases hail claim approval by 35%",
        suggestedAction: "document_test_square",
      },
    },
    {
      name: "HighValueClaimNeedsEngineering",
      description: "Claims over $50k benefit from engineering inspection",
      trigger: {
        all: [
          { path: "estimate.total", op: ">", value: 50000 },
          { path: "docs.engineeringReport", op: "==", value: false },
        ],
      },
      action: {
        type: "recommend",
        priority: "medium",
        message: "Consider engineering report for claims >$50k",
        suggestedAction: "schedule_engineering",
      },
    },
    {
      name: "WindDamageNeedsWeatherData",
      description: "Wind damage claims strengthened by weather service data",
      trigger: {
        all: [
          { path: "damageType", op: "contains", value: "wind" },
          { path: "docs.weatherReport", op: "==", value: false },
        ],
      },
      action: {
        type: "recommend",
        priority: "medium",
        message: "Attach weather data from NOAA/local service",
        suggestedAction: "fetch_weather_data",
      },
    },
    {
      name: "FastTrackLowValueClaims",
      description: "Claims under $5k can skip some documentation steps",
      trigger: {
        all: [
          { path: "estimate.total", op: "<", value: 5000 },
          { path: "state", op: "==", value: "ESTIMATE_DRAFTED" },
        ],
      },
      action: {
        type: "recommend",
        priority: "low",
        message: "This claim qualifies for fast-track submission",
        suggestedAction: "submit_to_carrier",
      },
    },
    {
      name: "SupplementRequiresComparison",
      description: "Supplement requests should show original vs revised scope",
      trigger: {
        all: [
          { path: "actionType", op: "==", value: "prepare_supplement" },
          { path: "docs.comparison", op: "==", value: false },
        ],
      },
      action: {
        type: "require",
        priority: "high",
        message: "Generate before/after comparison for supplement",
        suggestedAction: "generate_comparison",
      },
    },
    {
      name: "DenialRequiresAppeal",
      description: "Denied claims should trigger appeal workflow",
      trigger: {
        all: [
          { path: "outcome", op: "==", value: "denied" },
          { path: "appealGenerated", op: "==", value: false },
        ],
      },
      action: {
        type: "recommend",
        priority: "critical",
        message: "Generate appeal letter with denial-specific arguments",
        suggestedAction: "generate_appeal",
      },
    },
    {
      name: "CodeComplianceCheck",
      description: "All estimates should reference applicable building codes",
      trigger: {
        all: [
          { path: "estimate.total", op: ">", value: 1000 },
          { path: "narrative.codeCitations", op: "==", value: 0 },
        ],
      },
      action: {
        type: "flag",
        severity: "medium",
        message: "Add relevant building code citations for stronger claim",
        suggestedAction: "add_code_citations",
      },
    },
    {
      name: "MaterialMatchRequired",
      description: "Replacement materials should match existing when possible",
      trigger: {
        all: [
          { path: "estimate.materialMatch", op: "==", value: false },
          { path: "roof.age", op: "<", value: 10 },
        ],
      },
      action: {
        type: "flag",
        severity: "low",
        message: "Specify material matching for newer roofs",
        suggestedAction: "update_materials",
      },
    },
    {
      name: "TimelyFollowUp",
      description: "Claims pending over 14 days need follow-up",
      trigger: {
        all: [
          { path: "state", op: "==", value: "SUBMITTED" },
          { path: "daysSinceSubmission", op: ">", value: 14 },
        ],
      },
      action: {
        type: "alert",
        priority: "high",
        message: "Follow up with carrier - claim pending 14+ days",
        suggestedAction: "contact_adjuster",
      },
    },
    {
      name: "NegotiationOpportunity",
      description: "Partial approvals often negotiable for full amount",
      trigger: {
        all: [
          { path: "outcome", op: "==", value: "partial" },
          { path: "negotiationAttempted", op: "==", value: false },
        ],
      },
      action: {
        type: "recommend",
        priority: "high",
        message: "Negotiate partial approval - 67% success rate for full amount",
        suggestedAction: "initiate_negotiation",
      },
    },
  ];

  for (const rule of rules) {
    const created = await prisma.rule.upsert({
      where: { name: rule.name },
      update: rule,
      create: rule,
    });
    console.log(`  ✅ ${created.name}`);
  }

  // PHASE Q - 15 GLOBAL CARRIER RULES
  const phaseQRules = [
    {
      name: "FunctionalHailDamageThreshold",
      description: "8-12 hail hits per 100 sq ft triggers full replacement per all carriers",
      trigger: {
        all: [{ path: "hailHits", op: ">=", value: 8 }],
      },
      action: {
        type: "RECOMMEND_FULL_REPLACEMENT",
        reasoning:
          "Functional damage threshold met per AAA, Allstate, AmFam, Farmers, Liberty, Nationwide, Progressive, State Farm, Travelers, USAA standards",
      },
    },
    {
      name: "MatFractureReplacementTrigger",
      description: "Any mat fracture requires slope replacement - all carriers",
      trigger: {
        any: [{ path: "matFracture", op: "==", value: true }],
      },
      action: {
        type: "REPLACE_SLOPE",
        reasoning:
          "Mat fracture represents functional impairment - referenced across all carrier guidelines",
      },
    },
    {
      name: "BrittleTestFailure",
      description: "Failed brittle test indicates non-repairable condition",
      trigger: {
        all: [{ path: "brittleTest", op: "==", value: false }],
      },
      action: {
        type: "FULL_SLOPE_REPLACEMENT",
        reasoning:
          "Allstate, AmFam, Farmers, Liberty, State Farm require replacement on brittle test failure",
      },
    },
    {
      name: "ManufacturerRepairLimitations",
      description: "Tile/metal/interlocking designs cannot repair individual units",
      trigger: {
        any: [
          { path: "roofType", op: "==", value: "TILE" },
          { path: "roofType", op: "==", value: "METAL" },
          { path: "roofType", op: "==", value: "INTERLOCK" },
        ],
      },
      action: {
        type: "FULL_SLOPE_REPLACEMENT",
        reasoning:
          "AAA, Allstate, AmFam, Farmers, Liberty, USAA, State Farm cite manufacturer limitations",
      },
    },
    {
      name: "DripEdgeCodeRequirement",
      description: "IRC R905.2.8.5 requires drip edge on all eaves and rakes",
      trigger: {},
      action: {
        type: "CODE_REQUIRED",
        lineItem: "DRIP_EDGE",
        codeCitation: "IRC R905.2.8.5",
        reasoning: "Universal code requirement cited by all carriers",
      },
    },
    {
      name: "IceWaterShieldRequirement",
      description: "IRC R905.1.2 requires ice & water shield on slopes ≤4:12",
      trigger: {
        all: [{ path: "roofSlope", op: "<=", value: 4 }],
      },
      action: {
        type: "CODE_REQUIRED",
        lineItem: "ICE_WATER_SHIELD",
        codeCitation: "IRC R905.1.2",
        reasoning: "Code requirement for low-slope roofs per all carriers",
      },
    },
    {
      name: "VentilationCodeCompliance",
      description: "IRC R806 requires proper attic ventilation (1:150 or 1:300 with vapor barrier)",
      trigger: {
        any: [{ path: "ventilationDeficient", op: "==", value: true }],
      },
      action: {
        type: "CODE_REQUIRED",
        lineItem: "VENTILATION_CORRECTION",
        codeCitation: "IRC R806",
        reasoning: "Ventilation code compliance required by all carriers",
      },
    },
    {
      name: "StormOpeningWaterDamageRule",
      description: "Water intrusion must link to storm-created opening",
      trigger: {
        all: [
          { path: "waterDamage", op: "==", value: true },
          { path: "stormOpening", op: "==", value: false },
        ],
      },
      action: {
        type: "FLAG_FOR_ESCALATION",
        reasoning:
          "AAA, Allstate, AmFam, Farmers, Progressive, Nationwide, Liberty, Travelers, USAA require storm opening proof",
      },
    },
    {
      name: "MoistureMappingRule",
      description: "FLIR documentation with serial numbers required for water claims",
      trigger: {
        all: [{ path: "waterDamage", op: "==", value: true }],
      },
      action: {
        type: "DOCUMENTATION_REQUIRED",
        required: ["FLIR_MAPPING", "SERIAL_NUMBERED_LOGS"],
        reasoning: "All carriers require moisture mapping evidence",
      },
    },
    {
      name: "CodeEnforcementRule",
      description: "Always include code compliance matrix showing cost differential",
      trigger: {},
      action: {
        type: "INCLUDE_CODE_MATRIX",
        reasoning: "Liberty Mutual and others stress code cost documentation",
      },
    },
    {
      name: "SuddenAccidentalIntrusion",
      description: "Water intrusion must be sudden & accidental, not gradual",
      trigger: {
        all: [
          { path: "waterDamage", op: "==", value: true },
          { path: "gradualDamage", op: "==", value: true },
        ],
      },
      action: {
        type: "DENY_COVERAGE",
        reasoning: "Progressive, Travelers, USAA require sudden & accidental proof",
      },
    },
    {
      name: "NOAAHailTraceCorrelation",
      description: "Storm date must correlate with NOAA/HailTrace data",
      trigger: {
        all: [{ path: "weatherVerification", op: "==", value: false }],
      },
      action: {
        type: "DOCUMENTATION_REQUIRED",
        required: ["NOAA_DATA", "HAILTRACE_VERIFICATION"],
        reasoning: "AAA, AmFam, Farmers, Nationwide, Travelers, USAA require weather correlation",
      },
    },
    {
      name: "DirectionalityWindVectorRule",
      description: "Document wind direction via bent fins, debris patterns, displaced caps",
      trigger: {
        all: [{ path: "windDamage", op: "==", value: true }],
      },
      action: {
        type: "DOCUMENTATION_REQUIRED",
        required: ["DIRECTIONAL_PHOTOS", "WIND_VECTOR_MAP"],
        reasoning: "All carriers reference directionality in wind damage assessment",
      },
    },
    {
      name: "FM129CommercialEdgeMetal",
      description: "FM 1-29 compliance required for commercial low-slope roofs",
      trigger: {
        all: [
          { path: "commercialProperty", op: "==", value: true },
          { path: "roofSlope", op: "<=", value: 2 },
        ],
      },
      action: {
        type: "CODE_REQUIRED",
        lineItem: "FM_129_EDGE_METAL",
        codeCitation: "FM 1-29",
        reasoning: "Liberty Mutual, Travelers, Nationwide, Farmers require FM 1-29 compliance",
      },
    },
    {
      name: "LikeKindQualityMatching",
      description: "Discontinued materials require full slope replacement for LKQ matching",
      trigger: {
        all: [{ path: "productDiscontinued", op: "==", value: true }],
      },
      action: {
        type: "FULL_SLOPE_REPLACEMENT",
        reasoning: "State Farm, Liberty, USAA require Like-Kind-Quality matching",
      },
    },
  ];

  // Upsert Phase Q rules
  for (const rule of phaseQRules) {
    await prisma.rule.upsert({
      where: { name: rule.name },
      update: rule,
      create: rule,
    });
  }

  console.log(`✅ Added ${phaseQRules.length} Phase Q carrier-aware rules`);
  console.log("🎉 Rules seeded successfully!");
}

seedRules()
  .catch((e) => {
    console.error("❌ Error seeding rules:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
