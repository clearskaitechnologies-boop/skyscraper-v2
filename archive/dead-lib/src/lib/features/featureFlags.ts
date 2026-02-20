/**
 * Feature Flags System
 *
 * Enables/disables features dynamically without code changes
 * Supports org-level, user-level, and global flags
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type FeatureFlagScope = "GLOBAL" | "ORG" | "USER";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  scope: FeatureFlagScope;
  description?: string;
  rolloutPercentage?: number;
  targetOrgIds?: string[];
  targetUserIds?: string[];
}

// In-memory cache (use Redis in production)
const flagCache = new Map<string, FeatureFlag>();

/**
 * Default feature flags
 */
const DEFAULT_FLAGS: Record<string, boolean> = {
  // Core features
  messaging: true,
  realtime_updates: true,
  file_uploads: true,

  // Advanced features
  ai_assistant: true,
  advanced_reports: true,
  custom_workflows: false,
  api_access: true,

  // Beta features
  claims_ai_analysis: false,
  predictive_analytics: false,
  white_label: false,
  mobile_app: false,

  // Experimental
  new_dashboard: false,
  collaboration_tools: false,
  video_calls: false,
};

/**
 * Check if feature is enabled globally
 */
export function isFeatureEnabled(featureKey: string): boolean {
  // Check cache first
  if (flagCache.has(featureKey)) {
    return flagCache.get(featureKey)!.enabled;
  }

  // Check defaults
  return DEFAULT_FLAGS[featureKey] ?? false;
}

/**
 * Check if feature is enabled for org
 */
export async function isFeatureEnabledForOrg(featureKey: string, orgId: string): Promise<boolean> {
  // Check org-specific override
  try {
    const orgFlag = await prisma.featureFlag
      .findFirst({
        where: {
          key: featureKey,
          scope: "ORG",
          targetOrgIds: {
            has: orgId,
          },
        },
      })
      .catch(() => null);

    if (orgFlag) {
      return orgFlag.enabled;
    }
  } catch {
    // Fallback to global
  }

  // Check global flag
  return isFeatureEnabled(featureKey);
}

/**
 * Check if feature is enabled for user
 */
export async function isFeatureEnabledForUser(
  featureKey: string,
  userId: string,
  orgId?: string
): Promise<boolean> {
  // Check user-specific override
  try {
    const userFlag = await prisma.featureFlag
      .findFirst({
        where: {
          key: featureKey,
          scope: "USER",
          targetUserIds: {
            has: userId,
          },
        },
      })
      .catch(() => null);

    if (userFlag) {
      return userFlag.enabled;
    }
  } catch {
    // Continue to org check
  }

  // Check org-level
  if (orgId) {
    return isFeatureEnabledForOrg(featureKey, orgId);
  }

  // Check global
  return isFeatureEnabled(featureKey);
}

/**
 * Enable feature flag
 */
export async function enableFeature(
  featureKey: string,
  scope: FeatureFlagScope = "GLOBAL",
  targets?: { orgIds?: string[]; userIds?: string[] }
): Promise<void> {
  try {
    await prisma.featureFlag
      .upsert({
        where: {
          key_scope: {
            key: featureKey,
            scope,
          },
        },
        create: {
          key: featureKey,
          enabled: true,
          scope,
          targetOrgIds: targets?.orgIds || [],
          targetUserIds: targets?.userIds || [],
        },
        update: {
          enabled: true,
          targetOrgIds: targets?.orgIds,
          targetUserIds: targets?.userIds,
        },
      })
      .catch(() => {
        logger.warn("⚠️ FeatureFlag table not found - using in-memory cache");
        flagCache.set(featureKey, {
          key: featureKey,
          enabled: true,
          scope,
          targetOrgIds: targets?.orgIds,
          targetUserIds: targets?.userIds,
        });
      });

    // Update cache
    flagCache.set(featureKey, {
      key: featureKey,
      enabled: true,
      scope,
      targetOrgIds: targets?.orgIds,
      targetUserIds: targets?.userIds,
    });
  } catch (error) {
    logger.error("Failed to enable feature:", error);
  }
}

/**
 * Disable feature flag
 */
export async function disableFeature(
  featureKey: string,
  scope: FeatureFlagScope = "GLOBAL"
): Promise<void> {
  try {
    await prisma.featureFlag
      .update({
        where: {
          key_scope: {
            key: featureKey,
            scope,
          },
        },
        data: {
          enabled: false,
        },
      })
      .catch(() => {
        flagCache.set(featureKey, {
          key: featureKey,
          enabled: false,
          scope,
        });
      });

    // Update cache
    const cached = flagCache.get(featureKey);
    if (cached) {
      cached.enabled = false;
    }
  } catch (error) {
    logger.error("Failed to disable feature:", error);
  }
}

/**
 * Get all feature flags
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const dbFlags = await prisma.featureFlag.findMany().catch(() => []);

    // Merge with defaults
    const allFlags: FeatureFlag[] = [];

    // Add DB flags
    for (const flag of dbFlags) {
      allFlags.push({
        key: flag.key,
        enabled: flag.enabled,
        scope: flag.scope as FeatureFlagScope,
        description: flag.description || undefined,
        rolloutPercentage: flag.rolloutPercentage || undefined,
        targetOrgIds: (flag.targetOrgIds as string[]) || undefined,
        targetUserIds: (flag.targetUserIds as string[]) || undefined,
      });
    }

    // Add defaults not in DB
    for (const [key, enabled] of Object.entries(DEFAULT_FLAGS)) {
      if (!allFlags.find((f) => f.key === key)) {
        allFlags.push({
          key,
          enabled,
          scope: "GLOBAL",
        });
      }
    }

    return allFlags;
  } catch (error) {
    logger.error("Failed to get feature flags:", error);
    return Object.entries(DEFAULT_FLAGS).map(([key, enabled]) => ({
      key,
      enabled,
      scope: "GLOBAL" as FeatureFlagScope,
    }));
  }
}

/**
 * Enforce feature flag
 */
export async function enforceFeatureFlag(
  featureKey: string,
  userId?: string,
  orgId?: string
): Promise<void> {
  let enabled = false;

  if (userId) {
    enabled = await isFeatureEnabledForUser(featureKey, userId, orgId);
  } else if (orgId) {
    enabled = await isFeatureEnabledForOrg(featureKey, orgId);
  } else {
    enabled = isFeatureEnabled(featureKey);
  }

  if (!enabled) {
    throw new Error(`Feature '${featureKey}' is not available`);
  }
}

/**
 * Check gradual rollout
 */
export function isInRollout(userId: string, rolloutPercentage: number): boolean {
  // Hash user ID to get consistent random value
  const hash = userId.split("").reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0);
  }, 0);

  const bucket = Math.abs(hash % 100);
  return bucket < rolloutPercentage;
}
