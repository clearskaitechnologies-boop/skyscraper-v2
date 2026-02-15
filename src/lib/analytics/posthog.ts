// src/lib/analytics/posthog.ts
import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (typeof window !== "undefined" && !initialized && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[PostHog] Initialized in debug mode");
          posthog.debug();
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // Manual tracking only
    });
    initialized = true;
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== "undefined" && initialized) {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== "undefined" && initialized) {
    posthog.identify(userId, traits);
  }
}

export function resetUser() {
  if (typeof window !== "undefined" && initialized) {
    posthog.reset();
  }
}

// Event constants for type safety
export const EVENTS = {
  // Auth
  USER_SIGNED_UP: "user_signed_up",
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_OUT: "user_signed_out",

  // Claims
  CLAIM_CREATED: "claim_created",
  CLAIM_UPDATED: "claim_updated",
  CLAIM_SHARED: "claim_shared",
  CLAIM_DELETED: "claim_deleted",

  // Reports
  REPORT_GENERATED: "report_generated",
  PDF_DOWNLOADED: "pdf_downloaded",
  REPORT_EMAILED: "report_emailed",

  // Email
  EMAIL_SENT: "email_sent",
  EMAIL_OPENED: "email_opened",
  EMAIL_CLICKED: "email_clicked",

  // Settings
  BRANDING_UPDATED: "branding_updated",
  PROFILE_UPDATED: "profile_updated",
  TEAM_MEMBER_INVITED: "team_member_invited",

  // Workspace
  WORKSPACE_VIEWED: "workspace_viewed",
  DASHBOARD_VIEWED: "dashboard_viewed",
  PORTAL_VIEWED: "portal_viewed",
} as const;

/**
 * Helper functions for common tracking patterns
 */
export const analytics = {
  trackSignUp: (userId: string, orgId: string | null, method: "email" | "google" | "github") => {
    trackEvent(EVENTS.USER_SIGNED_UP, { userId, orgId, method });
  },

  trackSignIn: (userId: string, orgId: string | null) => {
    trackEvent(EVENTS.USER_SIGNED_IN, { userId, orgId });
    identifyUser(userId, { orgId });
  },

  trackSignOut: () => {
    trackEvent(EVENTS.USER_SIGNED_OUT);
    resetUser();
  },

  trackClaimCreated: (claimId: string, damageType: string, orgId: string | null) => {
    trackEvent(EVENTS.CLAIM_CREATED, { claimId, damageType, orgId });
  },

  trackClaimShared: (claimId: string, recipientEmail: string) => {
    trackEvent(EVENTS.CLAIM_SHARED, { claimId, recipientEmail });
  },

  trackPdfGenerated: (reportId: string, claimId: string) => {
    trackEvent(EVENTS.REPORT_GENERATED, { reportId, claimId });
  },

  trackEmailSent: (type: "client_invite" | "proposal" | "team_invite", recipientEmail: string) => {
    trackEvent(EVENTS.EMAIL_SENT, { type, recipientEmail });
  },

  trackBrandingUpdated: (orgId: string) => {
    trackEvent(EVENTS.BRANDING_UPDATED, { orgId });
  },

  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    trackEvent("page_viewed", { pageName, ...properties });
  },
};
