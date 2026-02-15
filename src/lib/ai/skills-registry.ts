/**
 * AI Skills Registry
 *
 * Maps internal AI tasks to human-readable skills with descriptions,
 * ideal inputs, and role-based access control.
 *
 * This is what you show to humans, sell to customers, and demo to GMs.
 */

export interface AISkill {
  id: string;
  internalTask: string;
  category: "damage" | "workflow" | "communication" | "analysis" | "estimation";
  name: string;
  description: string;
  detailedDescription: string;
  idealInputs: string[];
  requiredInputs: string[];
  outputs: string[];
  roleAccess: ("Free" | "Pro" | "Admin")[];
  estimatedTime: string;
  confidence: "high" | "medium" | "experimental";
  exampleUseCase: string;
  tags: string[];
}

export const AI_SKILLS: Record<string, AISkill> = {
  // ========== DAMAGE ASSESSMENT ==========
  "damage-detect-photos": {
    id: "damage-detect-photos",
    internalTask: "3d.detectObjects",
    category: "damage",
    name: "Detect Roof Damage in Photos",
    description: "Automatically identifies hail, wind, age, blistering, ponding from photos",
    detailedDescription:
      "Analyzes uploaded photos using 3D object detection to classify damage types including hail impacts, wind lifting, age-related wear, membrane blistering, and water ponding. Provides confidence scores and severity ratings for each detected issue.",
    idealInputs: ["photos", "claimId", "propertyType"],
    requiredInputs: ["photos"],
    outputs: [
      "damageTypes",
      "severityScores",
      "confidencePercentages",
      "annotatedImages",
      "recommendedActions",
    ],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "15-30 seconds",
    confidence: "high",
    exampleUseCase:
      "Roofer uploads 10 photos from a storm job. AI tags 'hail damage: severe' on 3 areas, 'wind lifting: moderate' on ridge, and 'age-related: minor' on flashing within 20 seconds.",
    tags: ["photos", "hail", "wind", "damage", "classification"],
  },

  "damage-video-analysis": {
    id: "damage-video-analysis",
    internalTask: "video.analyze",
    category: "damage",
    name: "Video Damage Walkthrough",
    description: "Extracts damage insights from walkthrough videos",
    detailedDescription:
      "Processes video walkthroughs to detect motion patterns, classify scenes, extract key frames, and track objects across frames. Automatically generates timestamps for areas of concern and provides summarized damage inventory.",
    idealInputs: ["videoUrl", "claimId"],
    requiredInputs: ["videoUrl"],
    outputs: ["keyframes", "damageTimestamps", "sceneClassification", "summary"],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "30-60 seconds",
    confidence: "high",
    exampleUseCase:
      "Adjuster records 2-minute roof walkthrough. AI extracts 8 key frames, timestamps damage at 0:23, 0:47, 1:15, and generates summary: 'Multiple hail impacts observed on north slope, wind damage on ridge cap.'",
    tags: ["video", "walkthrough", "damage", "timeline"],
  },

  "damage-3d-reconstruction": {
    id: "damage-3d-reconstruction",
    internalTask: "3d.reconstruct",
    category: "damage",
    name: "3D Roof Reconstruction",
    description: "Creates 3D model from multiple photo angles",
    detailedDescription:
      "Combines multiple photos from different angles to generate a 3D reconstruction of the roof surface. Enables measurement of damaged areas, slope calculations, and visualization of damage extent in three dimensions.",
    idealInputs: ["photos (3+ angles)", "claimId"],
    requiredInputs: ["photos"],
    outputs: ["3dModel", "measurements", "damagedAreaCalculations", "visualizations"],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "45-90 seconds",
    confidence: "medium",
    exampleUseCase:
      "Contractor takes 12 photos from different angles. AI generates 3D model showing 187 sq ft of damaged area on north slope with 6/12 pitch calculation.",
    tags: ["3d", "measurement", "reconstruction", "visualization"],
  },

  // ========== WORKFLOW OPTIMIZATION ==========
  "workflow-smart-triage": {
    id: "workflow-smart-triage",
    internalTask: "classification.triageClaim",
    category: "workflow",
    name: "Smart Claim Triage",
    description: "Classifies complexity and suggests optimal workflow path",
    detailedDescription:
      "Analyzes claim description, damage type, and estimated value to classify complexity level (simple/medium/complex), predict required resources, and suggest the most efficient workflow path from intake to close.",
    idealInputs: ["claimDescription", "damageType", "estimatedValue"],
    requiredInputs: ["claimDescription"],
    outputs: [
      "complexityScore",
      "suggestedWorkflow",
      "estimatedTimeline",
      "requiredResources",
      "riskFlags",
    ],
    roleAccess: ["Free", "Pro", "Admin"],
    estimatedTime: "5-10 seconds",
    confidence: "high",
    exampleUseCase:
      "New claim filed: 'Large hail storm, full roof replacement needed.' AI classifies as 'complex,' suggests workflow: Inspect → Document → PA Consult → Adjuster Meeting → Supplement, estimates 18-day timeline.",
    tags: ["triage", "workflow", "classification", "timeline"],
  },

  "workflow-next-actions": {
    id: "workflow-next-actions",
    internalTask: "multi-agent.optimizePolicy",
    category: "workflow",
    name: "AI-Powered Next Actions",
    description: "Recommends optimal next steps based on current claim state",
    detailedDescription:
      "Uses multi-agent reinforcement learning to analyze current claim status, available resources, and historical outcomes to recommend the 3-5 highest-impact next actions. Considers timeline, budget, and stakeholder priorities.",
    idealInputs: ["claimId", "currentStatus", "availableResources"],
    requiredInputs: ["claimId"],
    outputs: [
      "rankedActions",
      "impactScores",
      "reasoning",
      "resourceAllocation",
      "timelineProjection",
    ],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "10-15 seconds",
    confidence: "medium",
    exampleUseCase:
      "Claim stuck in 'supplement requested' for 9 days. AI suggests: (1) Follow up with adjuster (impact: high), (2) Prepare alternative scope (impact: medium), (3) Schedule PA call (impact: high).",
    tags: ["workflow", "optimization", "actions", "recommendations"],
  },

  "workflow-resource-allocation": {
    id: "workflow-resource-allocation",
    internalTask: "multi-agent.coordinateWorkflow",
    category: "workflow",
    name: "Resource Optimization",
    description: "Coordinates team assignments and material allocation",
    detailedDescription:
      "Analyzes multiple active claims to optimize crew assignments, material orders, and timeline coordination. Reduces conflicts, minimizes downtime, and maximizes throughput across your entire portfolio.",
    idealInputs: ["activeClaims", "availableCrews", "materialInventory"],
    requiredInputs: ["activeClaims"],
    outputs: ["crewAssignments", "materialOrders", "scheduleSuggestions", "bottleneckWarnings"],
    roleAccess: ["Admin"],
    estimatedTime: "20-30 seconds",
    confidence: "medium",
    exampleUseCase:
      "12 active claims with 4 crews available. AI suggests: Crew A to Jobs 1, 5, 8 (same subdivision, minimize travel), Crew B to Job 3 (large, needs 3 days), order shingles for Jobs 2, 6 by Tuesday.",
    tags: ["resources", "scheduling", "coordination", "optimization"],
  },

  // ========== COMMUNICATION ==========
  "communication-homeowner-summary": {
    id: "communication-homeowner-summary",
    internalTask: "captioning.generateSummary",
    category: "communication",
    name: "Homeowner-Friendly Summary",
    description: "Converts technical details to plain English for homeowners",
    detailedDescription:
      "Translates complex roofing terminology, damage classifications, and insurance jargon into clear, empathetic language that homeowners can understand. Includes visual aids suggestions and FAQ answers.",
    idealInputs: ["claimDetails", "damageAssessment", "estimateBreakdown"],
    requiredInputs: ["claimDetails"],
    outputs: ["plainEnglishSummary", "keyTakeaways", "nextSteps", "faqAnswers"],
    roleAccess: ["Free", "Pro", "Admin"],
    estimatedTime: "10-15 seconds",
    confidence: "high",
    exampleUseCase:
      "Technical scope: 'R&R 28 SQ architectural shingles, replace 12 LF ridge cap, install ice/water on eaves.' AI summary: 'We'll replace 2,800 square feet of damaged shingles and 12 feet of ridge cap. We'll also add waterproofing at the edges to prevent leaks.'",
    tags: ["communication", "homeowner", "summary", "translation"],
  },

  "communication-denial-rebuttal": {
    id: "communication-denial-rebuttal",
    internalTask: "semantic.analyzeDenial",
    category: "communication",
    name: "Denial Letter Assistant",
    description: "Analyzes denials and drafts structured rebuttals",
    detailedDescription:
      "Parses insurance denial letters to extract carrier arguments, identify missing considerations, cite relevant policy language, and draft a structured rebuttal with supporting evidence suggestions. Not legal advice, but provides professional framing.",
    idealInputs: ["denialLetterText", "policyDocument", "claimEvidence"],
    requiredInputs: ["denialLetterText"],
    outputs: [
      "carrierArguments",
      "counterpoints",
      "policyReferences",
      "evidenceGaps",
      "rebuttalDraft",
    ],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "20-30 seconds",
    confidence: "medium",
    exampleUseCase:
      "Denial: 'Damage appears to be wear and tear, not storm-related.' AI identifies argument, suggests counterpoints: 'Recent storm date (6/15), no prior damage documentation, hail confirmed by NWS,' drafts rebuttal citing policy exclusions language.",
    tags: ["denial", "rebuttal", "carrier", "communication"],
  },

  "communication-update-draft": {
    id: "communication-update-draft",
    internalTask: "prompting.generateUpdate",
    category: "communication",
    name: "Homeowner Update Writer",
    description: "Drafts status updates for homeowner communication",
    detailedDescription:
      "Generates professional yet friendly status update emails or texts for homeowners based on current claim progress. Includes timeline updates, next steps, and proactive answers to likely questions.",
    idealInputs: ["claimStatus", "recentActivity", "upcomingMilestones"],
    requiredInputs: ["claimStatus"],
    outputs: ["draftEmail", "draftText", "keyPoints", "callToAction"],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "8-12 seconds",
    confidence: "high",
    exampleUseCase:
      "Status: 'Supplement approved, scheduling final inspection.' AI draft: 'Great news! Your supplement was approved by the insurance company. We're now scheduling the final inspection with the adjuster. You should expect us to start work within 5-7 business days. I'll call you tomorrow to confirm the start date.'",
    tags: ["communication", "homeowner", "update", "email"],
  },

  // ========== ANALYSIS ==========
  "analysis-blueprint-parser": {
    id: "analysis-blueprint-parser",
    internalTask: "semantic.analyzeBlueprint",
    category: "analysis",
    name: "Floor Plan Analysis",
    description: "Extracts rooms, measurements, and spatial data from blueprints",
    detailedDescription:
      "Parses uploaded floor plans, blueprints, and site drawings to extract room dimensions, identify spaces, detect measurements, and generate a structured data representation for estimating and planning purposes.",
    idealInputs: ["blueprintPDF", "propertyAddress"],
    requiredInputs: ["blueprintPDF"],
    outputs: ["roomList", "measurements", "spatialData", "3dModel", "estimateInputs"],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "30-45 seconds",
    confidence: "medium",
    exampleUseCase:
      "Upload 2-page floor plan PDF. AI extracts: Living room (18'x22'), Kitchen (12'x14'), 3 bedrooms, total sq ft: 2,340, identifies roof pitch from elevation view, outputs CSV for estimating software.",
    tags: ["blueprint", "floor plan", "measurements", "analysis"],
  },

  "analysis-cost-estimation": {
    id: "analysis-cost-estimation",
    internalTask: "inference.estimateCosts",
    category: "estimation",
    name: "AI Cost Estimator",
    description: "Generates preliminary cost estimates from damage assessment",
    detailedDescription:
      "Combines damage classification, material requirements, labor rates, and regional pricing data to generate preliminary cost estimates with line-item breakdowns. Includes high/low ranges and markup suggestions.",
    idealInputs: ["damageAssessment", "propertyLocation", "materialPrices"],
    requiredInputs: ["damageAssessment"],
    outputs: ["estimatedTotal", "lineItemBreakdown", "materialCosts", "laborCosts", "contingency"],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "15-20 seconds",
    confidence: "medium",
    exampleUseCase:
      "Damage: 28 SQ shingles, wind damage. AI estimates: Materials $4,200, Labor $7,800, Disposal $450, Permit $125, Total: $12,575 (range: $11,200-$14,300). Suggests 10% contingency for hidden damage.",
    tags: ["estimation", "cost", "pricing", "line items"],
  },

  // ========== REPORTING ==========
  "report-site-report-generator": {
    id: "report-site-report-generator",
    internalTask: "retrieval.generateReport",
    category: "analysis",
    name: "AI-Powered Site Report",
    description: "Generates comprehensive inspection reports automatically",
    detailedDescription:
      "Combines photos, notes, damage assessments, and measurements to generate a professional site inspection report with executive summary, damage breakdown, recommended scope, and adjuster notes.",
    idealInputs: ["claimPhotos", "inspectorNotes", "damageData", "measurements"],
    requiredInputs: ["claimPhotos"],
    outputs: ["reportPDF", "executiveSummary", "damageInventory", "scopeSuggestions"],
    roleAccess: ["Pro", "Admin"],
    estimatedTime: "40-60 seconds",
    confidence: "high",
    exampleUseCase:
      "After site visit with 15 photos and voice notes, click 'Generate Report.' AI produces 6-page PDF with executive summary, annotated photos, damage inventory table, and recommended scope—ready to send to adjuster.",
    tags: ["report", "inspection", "documentation", "PDF"],
  },
};

/**
 * Get all skills available to a specific role
 */
export function getSkillsByRole(role: "Free" | "Pro" | "Admin"): AISkill[] {
  return Object.values(AI_SKILLS).filter((skill) => skill.roleAccess.includes(role));
}

/**
 * Get skills by category
 */
export function getSkillsByCategory(category: AISkill["category"]): AISkill[] {
  return Object.values(AI_SKILLS).filter((skill) => skill.category === category);
}

/**
 * Get skill by internal task name
 */
export function getSkillByTask(taskName: string): AISkill | undefined {
  return Object.values(AI_SKILLS).find((skill) => skill.internalTask === taskName);
}

/**
 * Search skills by query
 */
export function searchSkills(query: string): AISkill[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(AI_SKILLS).filter(
    (skill) =>
      skill.name.toLowerCase().includes(lowerQuery) ||
      skill.description.toLowerCase().includes(lowerQuery) ||
      skill.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get skill statistics
 */
export function getSkillStats() {
  const skills = Object.values(AI_SKILLS);

  return {
    total: skills.length,
    byCategory: {
      damage: skills.filter((s) => s.category === "damage").length,
      workflow: skills.filter((s) => s.category === "workflow").length,
      communication: skills.filter((s) => s.category === "communication").length,
      analysis: skills.filter((s) => s.category === "analysis").length,
      estimation: skills.filter((s) => s.category === "estimation").length,
    },
    byConfidence: {
      high: skills.filter((s) => s.confidence === "high").length,
      medium: skills.filter((s) => s.confidence === "medium").length,
      experimental: skills.filter((s) => s.confidence === "experimental").length,
    },
    byRole: {
      free: getSkillsByRole("Free").length,
      pro: getSkillsByRole("Pro").length,
      admin: getSkillsByRole("Admin").length,
    },
  };
}
