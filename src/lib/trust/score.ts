/**
 * Trust Score Engine
 * Calculates contractor trustworthiness based on verification states and activity
 */

interface ContractorForScore {
  licenseVerified?: boolean;
  insuranceVerified?: boolean;
  businessVerified?: boolean;
  emailVerified?: boolean;
  emergencyReady?: boolean;
  lastSeenAt?: Date | string;
}

export function calculateTrustScore(contractor: ContractorForScore): number {
  let score = 0;

  // Verification badges (80 points total)
  if (contractor.licenseVerified) score += 25;
  if (contractor.insuranceVerified) score += 25;
  if (contractor.businessVerified) score += 20;
  if (contractor.emailVerified) score += 10;

  // Emergency readiness (10 points)
  if (contractor.emergencyReady) score += 10;

  // Activity boost (10 points max)
  if (contractor.lastSeenAt) {
    const lastSeen = new Date(contractor.lastSeenAt).getTime();
    const daysInactive = (Date.now() - lastSeen) / 86400000;

    if (daysInactive < 7) score += 10;      // Active this week
    else if (daysInactive < 30) score += 5; // Active this month
  }

  return Math.min(100, score);
}

/**
 * Get trust level label based on score
 */
export function getTrustLevel(score: number): string {
  if (score >= 90) return "Elite";
  if (score >= 70) return "Verified";
  if (score >= 50) return "Good";
  return "Basic";
}

/**
 * Check if contractor is verified (trust score >= 70)
 */
export function isVerified(score: number): boolean {
  return score >= 70;
}
