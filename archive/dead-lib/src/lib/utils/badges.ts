/**
 * GAMIFICATION BADGE SYSTEM
 * Master Prompt #56: Professional Identity and Gamification Framework
 *
 * This module defines badge types, award logic, and badge checking utilities
 * for internal team motivation and external professional credibility.
 */

import prisma from "@/lib/prisma";

// =====================================================
// BADGE DEFINITIONS
// =====================================================

export enum BadgeId {
  // Sales Excellence
  TOP_SALE = "TOP_SALE",
  HIGH_CLOSER = "HIGH_CLOSER",
  MILLION_DOLLAR_CLUB = "MILLION_DOLLAR_CLUB",

  // Lead Management
  TOP_FOLLOWUP = "TOP_FOLLOWUP",
  SPEED_DEMON = "SPEED_DEMON",
  LEAD_MAGNET = "LEAD_MAGNET",

  // Quality & Accuracy
  QC_EXCELLENCE = "QC_EXCELLENCE",
  ZERO_ERRORS = "ZERO_ERRORS",
  PRECISION_PRO = "PRECISION_PRO",

  // Customer Service
  CLIENT_CHAMPION = "CLIENT_CHAMPION",
  FIVE_STAR_PRO = "FIVE_STAR_PRO",
  TESTIMONIAL_KING = "TESTIMONIAL_KING",

  // Team Collaboration
  TEAM_PLAYER = "TEAM_PLAYER",
  MENTOR_MASTER = "MENTOR_MASTER",
  KNOWLEDGE_SHARER = "KNOWLEDGE_SHARER",

  // Innovation & Efficiency
  EFFICIENCY_EXPERT = "EFFICIENCY_EXPERT",
  INNOVATOR = "INNOVATOR",
  PROCESS_IMPROVER = "PROCESS_IMPROVER",

  // Tenure & Loyalty
  ONE_YEAR_CLUB = "ONE_YEAR_CLUB",
  THREE_YEAR_CLUB = "THREE_YEAR_CLUB",
  FIVE_YEAR_CLUB = "FIVE_YEAR_CLUB",

  // Special Recognition
  MVP = "MVP",
  GAME_CHANGER = "GAME_CHANGER",
  COMPANY_CHAMPION = "COMPANY_CHAMPION",
}

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  color: string; // Tailwind color class
  category: "sales" | "quality" | "service" | "team" | "innovation" | "tenure" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
  criteria: string;
}

export const BADGE_DEFINITIONS: Record<BadgeId, Badge> = {
  // Sales Excellence
  [BadgeId.TOP_SALE]: {
    id: BadgeId.TOP_SALE,
    name: "Top Sale",
    description: "Closed the highest value deal this month",
    icon: "🏆",
    color: "gold",
    category: "sales",
    rarity: "rare",
    criteria: "Highest monthly sale value",
  },
  [BadgeId.HIGH_CLOSER]: {
    id: BadgeId.HIGH_CLOSER,
    name: "High Closer",
    description: "Maintained 80%+ close rate this quarter",
    icon: "🎯",
    color: "emerald",
    category: "sales",
    rarity: "epic",
    criteria: "80%+ quarterly close rate",
  },
  [BadgeId.MILLION_DOLLAR_CLUB]: {
    id: BadgeId.MILLION_DOLLAR_CLUB,
    name: "Million Dollar Club",
    description: "Surpassed $1M in total sales",
    icon: "💎",
    color: "purple",
    category: "sales",
    rarity: "legendary",
    criteria: "$1M+ lifetime sales",
  },

  // Lead Management
  [BadgeId.TOP_FOLLOWUP]: {
    id: BadgeId.TOP_FOLLOWUP,
    name: "Top Follow-up",
    description: "Best response time to leads this month",
    // icon removed per finalization cleanup
    icon: "",
    color: "yellow",
    category: "sales",
    rarity: "rare",
    criteria: "Fastest average response time",
  },
  [BadgeId.SPEED_DEMON]: {
    id: BadgeId.SPEED_DEMON,
    name: "Speed Demon",
    description: "Responded to lead within 5 minutes",
    icon: "",
    color: "orange",
    category: "sales",
    rarity: "common",
    criteria: "Sub-5-minute response",
  },
  [BadgeId.LEAD_MAGNET]: {
    id: BadgeId.LEAD_MAGNET,
    name: "Lead Magnet",
    description: "Generated 50+ qualified leads",
    icon: "🧲",
    color: "blue",
    category: "sales",
    rarity: "epic",
    criteria: "50+ qualified leads",
  },

  // Quality & Accuracy
  [BadgeId.QC_EXCELLENCE]: {
    id: BadgeId.QC_EXCELLENCE,
    name: "QC Excellence",
    description: "Perfect quality score on last 10 inspections",
    icon: "✅",
    color: "green",
    category: "quality",
    rarity: "rare",
    criteria: "100% QC score (10 inspections)",
  },
  [BadgeId.ZERO_ERRORS]: {
    id: BadgeId.ZERO_ERRORS,
    name: "Zero Errors",
    description: "No estimate corrections required this quarter",
    icon: "🎖️",
    color: "teal",
    category: "quality",
    rarity: "epic",
    criteria: "Zero estimate errors (quarterly)",
  },
  [BadgeId.PRECISION_PRO]: {
    id: BadgeId.PRECISION_PRO,
    name: "Precision Pro",
    description: "Estimates within 2% of final invoice",
    icon: "📐",
    color: "cyan",
    category: "quality",
    rarity: "rare",
    criteria: "2% estimate accuracy",
  },

  // Customer Service
  [BadgeId.CLIENT_CHAMPION]: {
    id: BadgeId.CLIENT_CHAMPION,
    name: "Client Champion",
    description: "Resolved 100+ client issues with 5-star ratings",
    icon: "🛡️",
    color: "indigo",
    category: "service",
    rarity: "epic",
    criteria: "100+ 5-star resolutions",
  },
  [BadgeId.FIVE_STAR_PRO]: {
    id: BadgeId.FIVE_STAR_PRO,
    name: "Five Star Pro",
    description: "Maintained 5.0 average client rating",
    icon: "",
    color: "amber",
    category: "service",
    rarity: "rare",
    criteria: "5.0 average rating",
  },
  [BadgeId.TESTIMONIAL_KING]: {
    id: BadgeId.TESTIMONIAL_KING,
    name: "Testimonial King",
    description: "Earned 25+ client testimonials",
    icon: "👑",
    color: "purple",
    category: "service",
    rarity: "epic",
    criteria: "25+ testimonials",
  },

  // Team Collaboration
  [BadgeId.TEAM_PLAYER]: {
    id: BadgeId.TEAM_PLAYER,
    name: "Team Player",
    description: "Helped colleagues close 10+ deals",
    icon: "🤝",
    color: "pink",
    category: "team",
    rarity: "common",
    criteria: "Assisted 10+ deals",
  },
  [BadgeId.MENTOR_MASTER]: {
    id: BadgeId.MENTOR_MASTER,
    name: "Mentor Master",
    description: "Trained 5+ new team members",
    icon: "🎓",
    color: "violet",
    category: "team",
    rarity: "rare",
    criteria: "Trained 5+ members",
  },
  [BadgeId.KNOWLEDGE_SHARER]: {
    id: BadgeId.KNOWLEDGE_SHARER,
    name: "Knowledge Sharer",
    description: "Contributed 50+ helpful posts to team network",
    icon: "💡",
    color: "lime",
    category: "team",
    rarity: "common",
    criteria: "50+ team posts",
  },

  // Innovation & Efficiency
  [BadgeId.EFFICIENCY_EXPERT]: {
    id: BadgeId.EFFICIENCY_EXPERT,
    name: "Efficiency Expert",
    description: "Reduced average inspection time by 30%",
    icon: "⚙️",
    color: "slate",
    category: "innovation",
    rarity: "rare",
    criteria: "30% time reduction",
  },
  [BadgeId.INNOVATOR]: {
    id: BadgeId.INNOVATOR,
    name: "Innovator",
    description: "Implemented process improvement adopted company-wide",
    icon: "🔮",
    color: "fuchsia",
    category: "innovation",
    rarity: "legendary",
    criteria: "Company-wide process improvement",
  },
  [BadgeId.PROCESS_IMPROVER]: {
    id: BadgeId.PROCESS_IMPROVER,
    name: "Process Improver",
    description: "Suggested 10+ accepted improvements",
    icon: "",
    color: "stone",
    category: "innovation",
    rarity: "epic",
    criteria: "10+ accepted suggestions",
  },

  // Tenure & Loyalty
  [BadgeId.ONE_YEAR_CLUB]: {
    id: BadgeId.ONE_YEAR_CLUB,
    name: "One Year Club",
    description: "Celebrating 1 year with the company",
    icon: "",
    color: "rose",
    category: "tenure",
    rarity: "common",
    criteria: "1 year tenure",
  },
  [BadgeId.THREE_YEAR_CLUB]: {
    id: BadgeId.THREE_YEAR_CLUB,
    name: "Three Year Club",
    description: "Celebrating 3 years with the company",
    icon: "🎊",
    color: "pink",
    category: "tenure",
    rarity: "rare",
    criteria: "3 year tenure",
  },
  [BadgeId.FIVE_YEAR_CLUB]: {
    id: BadgeId.FIVE_YEAR_CLUB,
    name: "Five Year Club",
    description: "Celebrating 5 years with the company",
    icon: "🏅",
    color: "orange",
    category: "tenure",
    rarity: "epic",
    criteria: "5 year tenure",
  },

  // Special Recognition
  [BadgeId.MVP]: {
    id: BadgeId.MVP,
    name: "MVP",
    description: "Most Valuable Player this quarter",
    icon: "🥇",
    color: "gold",
    category: "special",
    rarity: "legendary",
    criteria: "Quarterly MVP selection",
  },
  [BadgeId.GAME_CHANGER]: {
    id: BadgeId.GAME_CHANGER,
    name: "Game Changer",
    description: "Made exceptional impact on company success",
    icon: "💫",
    color: "indigo",
    category: "special",
    rarity: "legendary",
    criteria: "Exceptional company impact",
  },
  [BadgeId.COMPANY_CHAMPION]: {
    id: BadgeId.COMPANY_CHAMPION,
    name: "Company Champion",
    description: "Embodies company values and culture",
    icon: "🌟",
    color: "purple",
    category: "special",
    rarity: "legendary",
    criteria: "Culture champion",
  },
};

// =====================================================
// BADGE AWARD INTERFACE
// =====================================================

export interface AwardedBadge {
  badgeId: BadgeId;
  badgeName: string;
  awardedAt: string; // ISO timestamp
  metadata?: Record<string, any>; // Additional context (e.g., value, claimId)
}

// =====================================================
// BADGE AWARD FUNCTION
// =====================================================

/**
 * Award a badge to a user
 * @param userId - User ID to award badge to
 * @param badgeId - Badge to award
 * @param metadata - Optional metadata (e.g., sale value, claim ID)
 * @returns true if badge awarded, false if already has badge
 */
export async function awardBadge(
  userId: string,
  badgeId: BadgeId,
  metadata?: Record<string, any>
): Promise<boolean> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { earned_badges: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const raw = user.earned_badges as any;
  const currentBadges: AwardedBadge[] = Array.isArray(raw)
    ? raw.filter((b: any) => b && typeof b === "object")
    : [];

  // Check if user already has this badge
  const hasBadge = currentBadges.some((b) => b.badgeId === badgeId);
  if (hasBadge) {
    return false; // Already has badge
  }

  const badge = BADGE_DEFINITIONS[badgeId];
  if (!badge) {
    throw new Error(`Badge ${badgeId} not found in definitions`);
  }

  // Create awarded badge object
  const awardedBadge: AwardedBadge = {
    badgeId,
    badgeName: badge.name,
    awardedAt: new Date().toISOString(),
    ...(metadata && { metadata }),
  };

  // Add badge to user's collection
  await prisma.users.update({
    where: { id: userId },
    data: {
      earned_badges: JSON.parse(JSON.stringify([...currentBadges, awardedBadge])) as any,
    },
  });

  return true;
}

/**
 * Check if user has a specific badge
 */
export function hasBadge(
  earnedBadges: AwardedBadge[] | null | undefined,
  badgeId: BadgeId
): boolean {
  if (!earnedBadges) return false;
  return earnedBadges.some((b) => b.badgeId === badgeId);
}

/**
 * Get user's badge count by category
 */
export function getBadgeCountByCategory(earnedBadges: AwardedBadge[]): Record<string, number> {
  const counts: Record<string, number> = {
    sales: 0,
    quality: 0,
    service: 0,
    team: 0,
    innovation: 0,
    tenure: 0,
    special: 0,
  };

  earnedBadges.forEach((awarded) => {
    const badge = BADGE_DEFINITIONS[awarded.badgeId];
    if (badge) {
      counts[badge.category]++;
    }
  });

  return counts;
}

/**
 * Get user's badge count by rarity
 */
export function getBadgeCountByRarity(earnedBadges: AwardedBadge[]): Record<string, number> {
  const counts: Record<string, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  earnedBadges.forEach((awarded) => {
    const badge = BADGE_DEFINITIONS[awarded.badgeId];
    if (badge) {
      counts[badge.rarity]++;
    }
  });

  return counts;
}

/**
 * Get badge display color classes
 */
export function getBadgeColorClasses(badgeId: BadgeId): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  const badge = BADGE_DEFINITIONS[badgeId];
  if (!badge) {
    return {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      glow: "shadow-gray-500/20",
    };
  }

  const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    gold: {
      bg: "bg-yellow-100",
      text: "text-yellow-900",
      border: "border-yellow-400",
      glow: "shadow-yellow-500/30",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-900",
      border: "border-emerald-400",
      glow: "shadow-emerald-500/30",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-900",
      border: "border-purple-400",
      glow: "shadow-purple-500/30",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-900",
      border: "border-blue-400",
      glow: "shadow-blue-500/30",
    },
    // Add more color mappings as needed
  };

  return (
    colorMap[badge.color] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      glow: "shadow-gray-500/20",
    }
  );
}

/**
 * Get rarity color for visual display
 */
export function getRarityColor(rarity: "common" | "rare" | "epic" | "legendary"): string {
  const colorMap = {
    common: "text-gray-600",
    rare: "text-blue-600",
    epic: "text-purple-600",
    legendary: "text-orange-600",
  };
  return colorMap[rarity];
}
