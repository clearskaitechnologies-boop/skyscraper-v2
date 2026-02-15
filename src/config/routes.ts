/**
 * Central Route Registry
 * Single source of truth for all application routes
 * Use this registry to eliminate route mismatches across navigation components
 */

export const ROUTES = {
  // Core
  dashboard: "/dashboard",
  tradesHub: "/trades",

  // AI Tools (canonical paths)
  aiMockup: "/ai/mockup",
  damageBuilder: "/ai/damage-builder",
  quickDOL: "/quick-dol",
  supplementBuilder: "/ai/tools/supplement",
  rebuttalBuilder: "/ai/tools/rebuttal",
  depreciationBuilder: "/ai/tools/depreciation",

  // Company
  teams: "/teams",
  mapView: "/maps/map-view",
  branding: "/settings/branding",
  settings: "/settings",

  // Weather
  weatherAnalytics: "/weather/analytics",
  reportsWeather: "/reports/weather",

  // Reports
  reports: "/reports",
  reportsHub: "/reports/hub",
  contractorPacket: "/reports/contractor-packet",

  // Networks
  vendorNetwork: "/vendor-network",
  tradesProfile: "/trades/profile",

  // Billing & Auth
  billing: "/settings/billing",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteValue = (typeof ROUTES)[RouteKey];
