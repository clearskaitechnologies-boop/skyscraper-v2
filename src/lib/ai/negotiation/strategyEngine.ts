/**
 * Negotiation Strategy Engine
 *
 * Advises on best tactics for negotiating with insurance carriers.
 * Combines carrier profiles with claim-specific analysis.
 */

import { NegotiationSuggestion } from "../types";
import { getCarrierStrategy } from "./carrierProfiles";

/**
 * Get negotiation suggestions for a claim
 */
export async function getNegotiationSuggestions(params: {
  carrier: string;
  claimId: string;
  denialReason?: string;
  estimateValue?: number;
}): Promise<NegotiationSuggestion[]> {
  const suggestions: NegotiationSuggestion[] = [];

  // Get carrier-specific strategy
  const carrierStrategy = await getCarrierStrategy(params.carrier);

  if (carrierStrategy) {
    suggestions.push(carrierStrategy);
  }

  // Add general best practices
  suggestions.push(getGeneralNegotiationStrategy());

  // Add claim-specific tactics
  if (params.denialReason) {
    suggestions.push(getDenialSpecificStrategy(params.denialReason));
  }

  // Add value-based tactics
  if (params.estimateValue && params.estimateValue > 50000) {
    suggestions.push(getHighValueStrategy(params.estimateValue));
  }

  return suggestions;
}

/**
 * General negotiation best practices
 */
function getGeneralNegotiationStrategy(): NegotiationSuggestion {
  return {
    summary: "General Insurance Negotiation Best Practices",
    steps: [
      "Provide clear, annotated photos showing all damage",
      "Cite specific building codes and manufacturer specifications",
      "Reference industry standards (HAAG, InterNACHI)",
      "Include weather data if storm-related",
      "Explain why each disputed line item is necessary",
      "Show comparable pricing from suppliers",
      "Be professional and fact-based in all communications",
    ],
    expectedImpact: "Increases approval rate by 25-40% on average",
    tactics: ["Use code citations", "Provide photo evidence", "Reference standards"],
    riskLevel: "low",
  };
}

/**
 * Strategy based on denial reason
 */
function getDenialSpecificStrategy(denialReason: string): NegotiationSuggestion {
  const reason = denialReason.toLowerCase();

  if (reason.includes("age") || reason.includes("wear")) {
    return {
      summary: "Address Age/Wear Denial",
      steps: [
        "Distinguish between pre-existing wear and new damage",
        "Provide hail test results showing impact damage",
        "Show that damage exceeds normal wear patterns",
        "Reference HAAG hail damage criteria",
      ],
      tactics: ["Hail testing", "Pattern analysis", "Expert testimony"],
      riskLevel: "medium",
    };
  }

  if (reason.includes("price") || reason.includes("cost")) {
    return {
      summary: "Address Pricing Dispute",
      steps: [
        "Provide quotes from 2-3 local suppliers",
        "Show prevailing wage rates for your area",
        "Explain any specialty items or difficulty factors",
        "Reference Xactimate pricing if applicable",
      ],
      tactics: ["Multiple quotes", "Market research", "Difficulty factors"],
      riskLevel: "low",
    };
  }

  if (reason.includes("code") || reason.includes("upgrade")) {
    return {
      summary: "Address Code Upgrade Denial",
      steps: [
        "Cite specific IRC/IBC sections",
        "Show manufacturer installation requirements",
        "Prove upgrade is required, not optional",
        "Reference local building department requirements",
      ],
      tactics: ["Code citations", "Manufacturer specs", "Building dept letter"],
      riskLevel: "low",
    };
  }

  return {
    summary: "General Denial Response",
    steps: [
      "Review denial letter carefully for specific objections",
      "Address each objection point-by-point",
      "Provide additional evidence as needed",
      "Request adjuster site visit if helpful",
    ],
    tactics: ["Point-by-point response", "Additional evidence"],
    riskLevel: "medium",
  };
}

/**
 * Strategy for high-value claims
 */
function getHighValueStrategy(estimateValue: number): NegotiationSuggestion {
  return {
    summary: `High-Value Claim Strategy ($${(estimateValue / 1000).toFixed(1)}K)`,
    steps: [
      "Consider hiring public adjuster or attorney",
      "Get independent engineering report",
      "Document everything meticulously",
      "Prepare for potential appraisal or arbitration",
      "Build comprehensive evidence package",
    ],
    expectedImpact: `Large claims benefit from professional representation`,
    tactics: ["Expert witnesses", "Engineering reports", "Professional representation"],
    riskLevel: "high",
  };
}
