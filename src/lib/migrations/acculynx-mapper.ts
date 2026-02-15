/**
 * AccuLynx → SkaiScraper Data Mapper
 *
 * Transforms AccuLynx API objects into SkaiScraper's Prisma schema.
 * This is the critical translation layer — their schema ≠ our schema.
 */

import type { AccuLynxContact, AccuLynxJob } from "./acculynx-client";

// ---------------------------------------------------------------------------
// Mapped output types (match Prisma create inputs)
// ---------------------------------------------------------------------------

export interface MappedContact {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  slug: string;
  /** Original AccuLynx ID for dedup tracking */
  externalId: string;
  externalSource: "acculynx";
}

export interface MappedProperty {
  name: string;
  propertyType: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  externalId: string;
  externalSource: "acculynx";
}

export interface MappedLead {
  title: string;
  description: string | null;
  source: string;
  value: number | null;
  stage: string;
  temperature: string;
  jobCategory: string;
  jobType: string;
  workType: string;
  externalId: string;
  externalSource: "acculynx";
}

export interface MappedJob {
  title: string;
  description: string | null;
  jobType: string;
  status: string;
  estimatedCost: number | null;
  externalId: string;
  externalSource: "acculynx";
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export function mapContact(src: AccuLynxContact): MappedContact {
  return {
    firstName: src.firstName || "Unknown",
    lastName: src.lastName || "Contact",
    email: src.email || null,
    phone: src.phone || null,
    street: src.address?.street || null,
    city: src.address?.city || null,
    state: src.address?.state || null,
    zipCode: src.address?.zip || null,
    slug: slugify(`${src.firstName}-${src.lastName}-${src.id.slice(0, 6)}`),
    externalId: src.id,
    externalSource: "acculynx",
  };
}

export function mapJobToProperty(src: AccuLynxJob): MappedProperty {
  return {
    name: src.name || "Imported Property",
    propertyType: "residential", // AccuLynx is roofing-focused → residential default
    street: src.address?.street || null,
    city: src.address?.city || null,
    state: src.address?.state || null,
    zipCode: src.address?.zip || null,
    externalId: src.id,
    externalSource: "acculynx",
  };
}

export function mapJobToLead(src: AccuLynxJob): MappedLead {
  const stage = mapAccuLynxStatusToStage(src.status);
  return {
    title: src.name || "Imported Lead",
    description: src.description || null,
    source: "migration",
    value: src.estimatedRevenue ? Math.round(src.estimatedRevenue * 100) : null, // dollars → cents
    stage: stage.stage,
    temperature: stage.temperature,
    jobCategory: "lead",
    jobType: mapAccuLynxJobType(src.jobType),
    workType: "lead_prospect",
    externalId: src.id,
    externalSource: "acculynx",
  };
}

export function mapJobToJob(src: AccuLynxJob): MappedJob {
  return {
    title: src.name || "Imported Job",
    description: src.description || null,
    jobType: mapAccuLynxJobType(src.jobType),
    status: mapAccuLynxJobStatus(src.status),
    estimatedCost: src.estimatedRevenue ? Math.round(src.estimatedRevenue * 100) : null,
    externalId: src.id,
    externalSource: "acculynx",
  };
}

// ---------------------------------------------------------------------------
// Status / Type mapping tables
// ---------------------------------------------------------------------------

function mapAccuLynxStatusToStage(status: string): { stage: string; temperature: string } {
  const s = (status || "").toLowerCase();
  if (s.includes("lead") || s.includes("prospect")) return { stage: "NEW", temperature: "cold" };
  if (s.includes("estimate") || s.includes("inspect"))
    return { stage: "QUALIFIED", temperature: "warm" };
  if (s.includes("proposal") || s.includes("contract"))
    return { stage: "PROPOSAL", temperature: "warm" };
  if (s.includes("sold") || s.includes("approved")) return { stage: "WON", temperature: "hot" };
  if (s.includes("closed") || s.includes("complete")) return { stage: "WON", temperature: "hot" };
  if (s.includes("lost") || s.includes("cancel")) return { stage: "LOST", temperature: "cold" };
  return { stage: "NEW", temperature: "cold" };
}

function mapAccuLynxJobType(jobType: string): string {
  const jt = (jobType || "").toLowerCase();
  if (jt.includes("roof")) return "roof_replacement";
  if (jt.includes("gutter")) return "gutter";
  if (jt.includes("siding")) return "siding";
  if (jt.includes("window")) return "windows";
  if (jt.includes("interior") || jt.includes("remodel")) return "remodel";
  if (jt.includes("inspect")) return "inspection";
  if (jt.includes("repair")) return "roof_repair";
  return "other";
}

function mapAccuLynxJobStatus(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("complete") || s.includes("closed")) return "completed";
  if (s.includes("progress") || s.includes("active")) return "in_progress";
  if (s.includes("schedule")) return "scheduled";
  if (s.includes("cancel")) return "cancelled";
  return "pending";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
