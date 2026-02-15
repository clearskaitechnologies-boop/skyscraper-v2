import { AgentMission } from "./types";
// NOTE: AutoSupplement and AutoDepreciation missions moved to /deprecated
// They used prisma.crm_jobs and prisma.depreciation_packages which don't exist in schema

export const missionRegistry: AgentMission[] = [
  // AutoSupplementMission, // DEPRECATED - uses crm_jobs table that doesn't exist
  // AutoDepreciationMission, // DEPRECATED - uses depreciation_packages table that doesn't exist
  // AutoAppealMission (coming soon)
];
