/**
 * JobNimbus → SkaiScraper Data Mapper
 *
 * Transforms JobNimbus entities into SkaiScraper database models.
 * Handles all field mapping, data normalization, and relationship linking.
 */

import type {
  JobNimbusActivity,
  JobNimbusContact,
  JobNimbusFile,
  JobNimbusJob,
  JobNimbusTask,
} from "./jobnimbus-client";

// ============================================================================
// SkaiScraper Entity Types (matching Prisma schema)
// ============================================================================

export interface MappedLead {
  externalId: string; // jnid
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  phoneAlt: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MappedClaim {
  externalId: string; // jnid
  claimNumber: string | null; // job.number
  projectName: string;
  status: string;
  description: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  latitude: number | null;
  longitude: number | null;
  dateOfLoss: Date | null;
  estimateTotal: number | null;
  assignedTo: string | null;
  relatedContactIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MappedTask {
  externalId: string; // jnid
  title: string;
  description: string | null;
  type: string;
  isCompleted: boolean;
  dueDate: Date | null;
  completedAt: Date | null;
  relatedJobIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MappedDocument {
  externalId: string; // jnid
  filename: string;
  description: string | null;
  sourceUrl: string;
  contentType: string | null;
  relatedEntityIds: string[];
  createdAt: Date;
}

export interface MappedNote {
  externalId: string; // jnid
  type: string;
  content: string;
  relatedEntityIds: string[];
  createdAt: Date;
}

// ============================================================================
// Status Mapping
// ============================================================================

const JOB_STATUS_MAP: Record<string, string> = {
  lead: "NEW",
  "new lead": "NEW",
  contacted: "CONTACTED",
  scheduled: "SCHEDULED",
  "in progress": "IN_PROGRESS",
  "work complete": "COMPLETE",
  completed: "COMPLETE",
  closed: "CLOSED",
  won: "WON",
  lost: "LOST",
  on_hold: "ON_HOLD",
  "on hold": "ON_HOLD",
};

function mapStatus(jnStatus: string): string {
  const normalized = jnStatus?.toLowerCase()?.trim() || "";
  return JOB_STATUS_MAP[normalized] || "UNKNOWN";
}

// ============================================================================
// Mappers
// ============================================================================

export function mapContact(jnContact: JobNimbusContact): MappedLead {
  // Pick best available phone
  const phone = jnContact.mobile_phone || jnContact.home_phone || jnContact.work_phone;
  const phoneAlt =
    jnContact.mobile_phone && jnContact.home_phone !== jnContact.mobile_phone
      ? jnContact.home_phone
      : jnContact.work_phone !== phone
        ? jnContact.work_phone
        : null;

  return {
    externalId: jnContact.jnid,
    firstName: jnContact.first_name || "",
    lastName: jnContact.last_name || "",
    email: jnContact.email,
    phone,
    phoneAlt,
    addressStreet:
      [jnContact.address_line1, jnContact.address_line2].filter(Boolean).join(", ") || null,
    addressCity: jnContact.city,
    addressState: jnContact.state_text,
    addressZip: jnContact.zip,
    source: "JOBNIMBUS",
    createdAt: new Date(jnContact.date_created * 1000),
    updatedAt: new Date(jnContact.date_updated * 1000),
  };
}

export function mapJob(jnJob: JobNimbusJob): MappedClaim {
  const location = jnJob.location || {};

  return {
    externalId: jnJob.jnid,
    claimNumber: jnJob.number ? `JN-${jnJob.number}` : null,
    projectName: jnJob.name || `Job #${jnJob.number}`,
    status: mapStatus(jnJob.status_name),
    description: jnJob.description,
    addressStreet:
      [location.address_line1, location.address_line2].filter(Boolean).join(", ") || null,
    addressCity: location.city || null,
    addressState: location.state_text || null,
    addressZip: location.zip || null,
    latitude: location.geo?.lat || null,
    longitude: location.geo?.lon || null,
    dateOfLoss: jnJob.date_start ? new Date(jnJob.date_start * 1000) : null,
    estimateTotal: jnJob.approved_estimate_total,
    assignedTo: jnJob.sales_rep_name || jnJob.sales_rep || null,
    relatedContactIds: jnJob.related || [],
    createdAt: new Date(jnJob.date_created * 1000),
    updatedAt: new Date(jnJob.date_updated * 1000),
  };
}

export function mapTask(jnTask: JobNimbusTask): MappedTask {
  return {
    externalId: jnTask.jnid,
    title: jnTask.title || "Untitled Task",
    description: jnTask.description,
    type: jnTask.type || "TASK",
    isCompleted: jnTask.is_completed,
    dueDate: jnTask.date_due ? new Date(jnTask.date_due * 1000) : null,
    completedAt: jnTask.date_completed ? new Date(jnTask.date_completed * 1000) : null,
    relatedJobIds: jnTask.related || [],
    createdAt: new Date(jnTask.date_created * 1000),
    updatedAt: new Date(jnTask.date_updated * 1000),
  };
}

export function mapFile(jnFile: JobNimbusFile): MappedDocument {
  return {
    externalId: jnFile.jnid,
    filename: jnFile.filename || "unknown",
    description: jnFile.description,
    sourceUrl: jnFile.url,
    contentType: jnFile.content_type,
    relatedEntityIds: jnFile.related || [],
    createdAt: new Date(jnFile.date_created * 1000),
  };
}

export function mapActivity(jnActivity: JobNimbusActivity): MappedNote | null {
  // Only map activities that have actual content
  if (!jnActivity.note) return null;

  return {
    externalId: jnActivity.jnid,
    type: jnActivity.type || "NOTE",
    content: jnActivity.note,
    relatedEntityIds: jnActivity.related || [],
    createdAt: new Date(jnActivity.date_created * 1000),
  };
}

// ============================================================================
// Batch Mapper Utilities
// ============================================================================

export interface MappedMigrationData {
  leads: MappedLead[];
  claims: MappedClaim[];
  tasks: MappedTask[];
  documents: MappedDocument[];
  notes: MappedNote[];
  stats: {
    contactsProcessed: number;
    jobsProcessed: number;
    tasksProcessed: number;
    filesProcessed: number;
    activitiesProcessed: number;
    notesSkipped: number;
  };
}

export function mapAllData(
  contacts: JobNimbusContact[],
  jobs: JobNimbusJob[],
  tasks: JobNimbusTask[],
  files: JobNimbusFile[],
  activities: JobNimbusActivity[]
): MappedMigrationData {
  const leads = contacts.map(mapContact);
  const claims = jobs.map(mapJob);
  const mappedTasks = tasks.map(mapTask);
  const documents = files.map(mapFile);

  // Filter out null notes (activities without content)
  const notes: MappedNote[] = [];
  let notesSkipped = 0;
  for (const activity of activities) {
    const mapped = mapActivity(activity);
    if (mapped) {
      notes.push(mapped);
    } else {
      notesSkipped++;
    }
  }

  return {
    leads,
    claims,
    tasks: mappedTasks,
    documents,
    notes,
    stats: {
      contactsProcessed: contacts.length,
      jobsProcessed: jobs.length,
      tasksProcessed: tasks.length,
      filesProcessed: files.length,
      activitiesProcessed: activities.length,
      notesSkipped,
    },
  };
}

// ============================================================================
// Relationship Linker
// ============================================================================

/**
 * After importing, we need to link claims to leads using the jnid mappings
 */
export function buildRelationshipMap(
  leads: MappedLead[],
  claims: MappedClaim[]
): Map<string, string[]> {
  // Map from claim externalId -> lead externalIds
  const claimToLeads = new Map<string, string[]>();

  // Build a set of valid lead externalIds for lookup
  const leadIds = new Set(leads.map((l) => l.externalId));

  for (const claim of claims) {
    const relatedLeads = claim.relatedContactIds.filter((id) => leadIds.has(id));
    if (relatedLeads.length > 0) {
      claimToLeads.set(claim.externalId, relatedLeads);
    }
  }

  return claimToLeads;
}
