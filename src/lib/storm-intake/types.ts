// Storm Intake Engine - Core Types
// Phase 10: 90-Second Storm Intake with Live Weather Intelligence

export type IntakeSource = "PUBLIC" | "PORTAL";

export type IntakeStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type RoofType = "SHINGLE" | "TILE" | "METAL" | "FLAT" | "FOAM" | "OTHER";

export type MediaType = "PHOTO" | "VIDEO" | "IR";

/**
 * Storm Event Snapshot - Weather data at time of intake
 */
export interface StormEventSnapshot {
  hailSize?: number | null; // inches
  hailDate?: string | null; // ISO date string
  windSpeed?: number | null; // mph
  windDate?: string | null; // ISO date string
  stormsLast12Months?: number | null;
  provider?: "WEATHERSTACK" | "VISUALCROSSING" | null;
  rawData?: unknown; // optional for debugging
}

/**
 * Media Attachment
 */
export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string;
  tag?: string | null; // "hail-hit", "crease", "lifted-shingle"
  notes?: string | null;
  createdAt?: string;
}

/**
 * Storm Intake DTO - Main intake data structure
 */
export interface StormIntakeDTO {
  id: string;
  orgId?: string | null;
  userId?: string | null;
  leadId?: string | null;
  status: IntakeStatus;
  step: number;
  source: IntakeSource;

  // Location
  address: string;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  county?: string | null;

  // Structure
  roofType?: RoofType | null;
  roofPitch?: string | null;
  houseSqFt?: number | null;
  yearBuilt?: number | null;

  // Damage Assessment
  hailDamage?: boolean | null;
  windDamage?: boolean | null;
  leaksPresent?: boolean | null;
  interiorDamage?: boolean | null;
  severityScore?: number | null; // 0-100

  // Weather Event
  stormEvent?: StormEventSnapshot | null;

  // Media
  media?: MediaAttachment[];

  // Report
  reportUrl?: string | null;

  createdAt?: string;
  updatedAt?: string;
}
