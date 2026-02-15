// prisma/seeds/seedCarrierStrategies.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCarrierStrategies() {
  console.log("🎯 Seeding carrier strategies...");

  const strategies = [
    {
      carrier: "AAA",
      commonPushbacks: {
        patterns: [
          "Insufficient photographic evidence",
          "Damage appears cosmetic only",
          "Unable to correlate to storm date",
          "Hit density does not meet threshold",
        ],
      },
      aiResponses: {
        photoEvidence:
          "Attach comprehensive slope-level correlation with 6-10 labeled photos per slope showing eaves, rakes, valleys, ridges, and collateral damage patterns.",
        cosmeticClaim:
          "Document mat fracture, substrate bruising, exposed asphalt layer, and manufacturer non-repairability limitations per ASTM D7158 testing standards.",
        stormCorrelation:
          "Provide NOAA/HailTrace weather verification, timestamp correlation, and GPS-stamped inspection data matching storm path.",
        hitThreshold:
          "Include hit count per 100 sq ft (8-12 standard), demonstrate functional impairment per carrier's own guidelines.",
      },
      requirements: {
        photoMinimum: 10,
        weatherProof: true,
        hitDensityStandard: "8-12 per 100 sq ft",
        manufacturerDocs: true,
      },
      successRate: 0.72,
    },
    {
      carrier: "Allstate",
      commonPushbacks: {
        patterns: [
          "Damage is cosmetic, not functional",
          "Repair is feasible per manufacturer",
          "Overhead & profit not justified",
          "Scope exceeds necessary repairs",
        ],
      },
      aiResponses: {
        cosmeticVsFunctional:
          "Refute using mat fracture evidence, substrate bruising documentation, exposed fiberglass layer photos, brittle test results showing granule loss severity beyond manufacturer repair thresholds.",
        repairFeasible:
          "Cite manufacturer repair limitations documentation, interlock design constraints, tile/metal non-repairability standards, and discontinuation notices.",
        overheadProfit:
          "Document job complexity (multi-trade coordination, steep slope, multi-story access), attach historical invoices showing market O&P norms, explain contractor churn risk without proper compensation.",
        excessiveScope:
          "Cross-reference IRC code requirements (R905.2.8.5 drip edge, R806 ventilation, R903 underlayment), demonstrate each line item necessity with code citations.",
      },
      requirements: {
        brittleTest: true,
        manufacturerLimits: true,
        opJustification: true,
        codeCitations: true,
      },
      successRate: 0.68,
    },
    {
      carrier: "American Family",
      commonPushbacks: {
        patterns: [
          "Insufficient hail hit density",
          "Granule loss within acceptable limits",
          "No evidence of functional impairment",
          "Interior damage unrelated to storm event",
        ],
      },
      aiResponses: {
        hitDensity:
          "Provide comprehensive test square documentation (minimum 8-12 hits per 100 sq ft across multiple slopes), photographic evidence with measurement tools, collateral damage correlation (gutters, vents, flashing).",
        granuleLoss:
          "Document exposed asphalt layer, mat fracture, substrate bruising per ASTM standards, manufacturer testing results showing weatherability compromise.",
        functionalImpairment:
          "Cite manufacturer repair limitations, demonstrate leak risk from compromised seal integrity, reference insurance industry functional damage standards.",
        interiorCorrelation:
          "Moisture mapping with FLIR thermal imaging, serial-numbered photo logs, roof opening documentation, timeline correlation between storm date and interior discovery.",
      },
      requirements: {
        testSquares: true,
        collateralDamage: true,
        moistureMapping: true,
        hitDensityMinimum: 8,
      },
      successRate: 0.7,
    },
    {
      carrier: "Farmers",
      commonPushbacks: {
        patterns: [
          "Manufacturer allows repairs",
          "Shingle discontinuation not verified",
          "Code upgrades not covered",
          "Matching not required by policy",
        ],
      },
      aiResponses: {
        manufacturerRepairs:
          "Attach manufacturer technical bulletins specifying repair limitations, interlock design constraints documentation, warranty void clauses for partial repairs.",
        discontinuation:
          "Provide manufacturer discontinuation notice, color/style matching impossibility evidence, distributor confirmation of unavailability.",
        codeUpgrades:
          "Reference A.R.S. §20-461 ordinance or law coverage requirements, demonstrate code violations in existing installation requiring correction per IRC compliance.",
        matching:
          "Cite like-kind-and-quality policy provisions, demonstrate visible mismatch impact on property value, reference state-specific matching requirements.",
      },
      requirements: {
        manufacturerBulletins: true,
        discontinuationProof: true,
        codeEnforcement: true,
        matchingDocumentation: true,
      },
      successRate: 0.71,
    },
    {
      carrier: "Liberty Mutual",
      commonPushbacks: {
        patterns: [
          "Code compliance not storm-related",
          "FM 1-29 edge metal not required",
          "Ventilation corrections excluded",
          "Wind damage insufficient for replacement",
        ],
      },
      aiResponses: {
        codeCompliance:
          "Demonstrate how storm damage triggers permit requirement, which mandates full code compliance per IRC Section R105.2, cite ordinance or law coverage provisions.",
        fm129EdgeMetal:
          "Reference FM 1-29 commercial roofing standards, show existing installation non-compliance, demonstrate wind uplift risk without proper edge securement per ANSI/SPRI ES-1.",
        ventilationCorrections:
          "Cite IRC R806 ventilation requirements (1:150 ratio), document existing deficiencies, demonstrate how code enforcement requires correction upon permit pull.",
        windDamage:
          "Provide directional damage mapping, bent/displaced flashing evidence, wind vector correlation with NOAA data, demonstrate creasing/buckling patterns consistent with wind event severity.",
      },
      requirements: {
        codeJustification: true,
        commercialStandards: true,
        windVectorMapping: true,
        ventilationCalculations: true,
      },
      successRate: 0.69,
    },
    {
      carrier: "Nationwide",
      commonPushbacks: {
        patterns: [
          "Test squares show insufficient damage",
          "Collateral damage absent or inconsistent",
          "Storm date correlation weak",
          "Repair costs exceed replacement value",
        ],
      },
      aiResponses: {
        testSquares:
          "Expand test square count (minimum 3-4 per slope), photograph with measurement context, document hit density and pattern consistency across all exposures.",
        collateralDamage:
          "Comprehensive inventory: gutters, downspouts, ridge vents, pipe boots, HVAC units, satellite dishes, window trim, demonstrating uniform impact pattern.",
        stormDate:
          "NOAA Storm Events Database correlation, HailTrace verification, local weather station data, neighbor claims timeline, adjuster notes from initial inspection.",
        costJustification:
          "Itemized estimate showing repair complexity, safety risk, warranty preservation requirements, demonstrate long-term cost-effectiveness versus temporary repairs.",
      },
      requirements: {
        multipleTestSquares: true,
        comprehensiveCollateral: true,
        weatherDatabase: true,
        costAnalysis: true,
      },
      successRate: 0.67,
    },
    {
      carrier: "Progressive",
      commonPushbacks: {
        patterns: [
          "Water damage not sudden and accidental",
          "Leak existed prior to storm",
          "Maintenance-related deterioration",
          "Timestamp inconsistencies",
        ],
      },
      aiResponses: {
        suddenAccidental:
          "Establish clear timeline: storm date → discovery date → first visible water intrusion, demonstrate no prior leak history via homeowner affidavit and maintenance records.",
        priorLeak:
          "Moisture meter readings showing fresh moisture only, absence of mold/staining consistent with recent exposure, contractor affidavit ruling out pre-existing condition.",
        maintenanceDeterioration:
          "Roof age vs useful life analysis, demonstrate proper maintenance history, show damage characteristics inconsistent with wear/tear (impact craters, displacement, fractures).",
        timestamps:
          "GPS-stamped inspection photos with EXIF data, dated correspondence, adjuster scheduling documentation, establish unbroken chain of events from storm to claim.",
      },
      requirements: {
        timelineDocumentation: true,
        moistureAnalysis: true,
        maintenanceHistory: true,
        gpsTimestamps: true,
      },
      successRate: 0.66,
    },
    {
      carrier: "State Farm",
      commonPushbacks: {
        patterns: [
          "Like-kind-and-quality allows different product",
          "Brittle test not failed sufficiently",
          "Granule loss cosmetic only",
          "Matching limited to visible areas",
        ],
      },
      aiResponses: {
        lkq: "Cite policy LKQ provisions requiring exact material match when available, demonstrate architectural/aesthetic mismatch impact, reference state insurance regulations requiring reasonable matching.",
        brittleTest:
          "Document brittle test methodology per ASTM D7158, show granule loss percentage exceeding manufacturer warranty thresholds, photograph substrate exposure and seal integrity compromise.",
        granuleLoss:
          "Differentiate cosmetic vs functional using mat layer exposure evidence, demonstrate accelerated weathering risk, cite manufacturer specifications for replacement triggers.",
        matchingScope:
          "Demonstrate uniform weathering across all slopes requires full replacement for cohesive appearance, cite diminished property value from partial mismatched repairs.",
      },
      requirements: {
        lkqDocumentation: true,
        brittleTestResults: true,
        granuleAnalysis: true,
        aestheticImpact: true,
      },
      successRate: 0.73,
    },
    {
      carrier: "Travelers",
      commonPushbacks: {
        patterns: [
          "Directionality inconsistent with reported storm",
          "Damage patterns suggest multiple events",
          "Wind speed insufficient for claimed damage",
          "Timeline conflicts with weather data",
        ],
      },
      aiResponses: {
        directionality:
          "Provide comprehensive directional damage mapping: bent fins orientation, debris drift patterns, displaced cap orientation, correlate with NOAA wind vector data for storm date.",
        multipleEvents:
          "Demonstrate uniform damage characteristics, consistent impact depth/pattern, single weathering degree across all affected areas, rule out progressive deterioration.",
        windSpeed:
          "Reference FM 1-29 and ANSI/SPRI wind uplift standards, show existing installation deficiencies, demonstrate damage consistent with reported wind speeds per engineering analysis.",
        timeline:
          "Cross-reference multiple weather databases (NOAA, NWS, local airports), provide neighbor storm observations, establish unambiguous correlation between specific storm event and damage discovery.",
      },
      requirements: {
        directionalMapping: true,
        uniformityAnalysis: true,
        windEngineering: true,
        multiSourceWeather: true,
      },
      successRate: 0.68,
    },
    {
      carrier: "USAA",
      commonPushbacks: {
        patterns: [
          "Evidence integrity questioned",
          "Thermal imaging shows pre-existing moisture",
          "Serial number documentation insufficient",
          "Chain of custody gaps in documentation",
        ],
      },
      aiResponses: {
        evidenceIntegrity:
          "Provide complete photo manifest with unbroken EXIF metadata, GPS coordinates, timestamps, inspector credentials, maintain documented chain of custody from inspection through claim submission.",
        thermalImaging:
          "Differentiate fresh moisture (post-storm) from old using temperature differentials, moisture meter correlations, lack of secondary indicators (mold, staining, structural deterioration).",
        serialNumbers:
          "Implement serial-numbered photo logging system, maintain indexed photo database, cross-reference each claim element with specific documented evidence, provide complete photo inventory.",
        chainCustody:
          "Document every inspection visit, maintain signed inspection reports, time-stamped communications log, demonstrate unbroken documentation trail from loss date through resolution.",
      },
      requirements: {
        exifMetadata: true,
        thermalAnalysis: true,
        serialNumberedPhotos: true,
        chainOfCustody: true,
      },
      successRate: 0.75,
    },
  ];

  for (const strategy of strategies) {
    await prisma.carrierStrategy.upsert({
      where: { carrier: strategy.carrier },
      update: strategy,
      create: strategy,
    });
  }

  console.log(`✅ Seeded ${strategies.length} carrier strategies`);
  console.log("   Carriers: AAA, Allstate, American Family, Farmers, Liberty Mutual,");
  console.log("             Nationwide, Progressive, State Farm, Travelers, USAA");
}

// Run if called directly
seedCarrierStrategies()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
