/**
 * Notification Constants
 *
 * Notification types and configuration
 */

export const NOTIFICATION_TYPES = {
  // Claim-related
  CLAIM_CREATED: "claim_created",
  CLAIM_UPDATED: "claim_updated",
  CLAIM_STATUS_CHANGED: "claim_status_changed",
  CLAIM_ASSIGNED: "claim_assigned",

  // Document-related
  DOCUMENT_UPLOADED: "document_uploaded",
  DOCUMENT_SHARED: "document_shared",
  REPORT_READY: "report_ready",

  // Portal-related
  PORTAL_ACCESS_GRANTED: "portal_access_granted",
  PORTAL_DOCUMENT_VIEWED: "portal_document_viewed",
  PORTAL_COMMENT_ADDED: "portal_comment_added",

  // Team-related
  TEAM_MEMBER_ADDED: "team_member_added",
  TEAM_MEMBER_REMOVED: "team_member_removed",

  // AI-related
  AI_ANALYSIS_COMPLETE: "ai_analysis_complete",
  AI_REPORT_GENERATED: "ai_report_generated",

  // Trades-related
  CONTRACTOR_ASSIGNED: "contractor_assigned",
  CONTRACTOR_ACCEPTED: "contractor_accepted",
  JOB_COMPLETED: "job_completed",

  // System
  SYSTEM_ALERT: "system_alert",
  MAINTENANCE: "maintenance",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const NOTIFICATION_PRIORITIES = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  URGENT: 3,
} as const;

export const NOTIFICATION_CHANNELS = {
  IN_APP: "in_app",
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
} as const;

/**
 * Default notification settings by type
 */
export const DEFAULT_NOTIFICATION_SETTINGS: Record<
  string,
  { channels: string[]; priority: number }
> = {
  [NOTIFICATION_TYPES.CLAIM_CREATED]: {
    channels: ["in_app", "email"],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
  },
  [NOTIFICATION_TYPES.CLAIM_STATUS_CHANGED]: {
    channels: ["in_app"],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
  },
  [NOTIFICATION_TYPES.REPORT_READY]: {
    channels: ["in_app", "email"],
    priority: NOTIFICATION_PRIORITIES.HIGH,
  },
  [NOTIFICATION_TYPES.PORTAL_COMMENT_ADDED]: {
    channels: ["in_app", "email"],
    priority: NOTIFICATION_PRIORITIES.NORMAL,
  },
  [NOTIFICATION_TYPES.CONTRACTOR_ASSIGNED]: {
    channels: ["in_app", "email"],
    priority: NOTIFICATION_PRIORITIES.HIGH,
  },
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: {
    channels: ["in_app"],
    priority: NOTIFICATION_PRIORITIES.URGENT,
  },
};

/**
 * Notification categories for grouping
 */
export const NOTIFICATION_CATEGORY = {
  CLAIMS: "claims",
  DOCUMENTS: "documents",
  PORTAL: "portal",
  TEAM: "team",
  AI: "ai",
  TRADES: "trades",
  SYSTEM: "system",
} as const;

/**
 * Alias for NOTIFICATION_TYPES for backwards compatibility
 */
export const NOTIFICATION_TYPE = NOTIFICATION_TYPES;
