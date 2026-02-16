/**
 * Migration Engine Tests
 *
 * Tests for the migration infrastructure including:
 * - Base engine functionality
 * - JobNimbus mapper
 * - Progress tracking
 */

import { describe, expect, it, vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    migration_jobs: {
      create: vi.fn().mockResolvedValue({ id: "job-123" }),
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn(),
    },
    migration_items: {
      create: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    lead: {
      create: vi.fn().mockResolvedValue({ id: "lead-1" }),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    claim: {
      create: vi.fn().mockResolvedValue({ id: "claim-1" }),
    },
    claimNote: {
      create: vi.fn().mockResolvedValue({ id: "note-1" }),
    },
    claimDocument: {
      create: vi.fn().mockResolvedValue({ id: "doc-1" }),
    },
  },
  default: {
    migration_jobs: {
      create: vi.fn().mockResolvedValue({ id: "job-123" }),
      update: vi.fn().mockResolvedValue({}),
    },
    migration_items: {
      create: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  },
}));

// ============================================================================
// JobNimbus Mapper Tests
// ============================================================================

describe("JobNimbus Mapper", () => {
  it("should map contacts correctly", async () => {
    const { mapContact } = await import("@/lib/migrations/jobnimbus-mapper");

    const jnContact = {
      jnid: "contact-123",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      home_phone: "555-0100",
      mobile_phone: "555-0101",
      work_phone: null,
      address_line1: "123 Main St",
      address_line2: "Apt 4",
      city: "Phoenix",
      state_text: "AZ",
      zip: "85001",
      country: "USA",
      date_created: 1700000000,
      date_updated: 1700100000,
    };

    const mapped = mapContact(jnContact);

    expect(mapped.externalId).toBe("contact-123");
    expect(mapped.firstName).toBe("John");
    expect(mapped.lastName).toBe("Doe");
    expect(mapped.email).toBe("john@example.com");
    expect(mapped.phone).toBe("555-0101"); // Mobile preferred
    expect(mapped.phoneAlt).toBe("555-0100"); // Home as alt
    expect(mapped.addressCity).toBe("Phoenix");
    expect(mapped.addressState).toBe("AZ");
    expect(mapped.source).toBe("JOBNIMBUS");
  });

  it("should map jobs correctly", async () => {
    const { mapJob } = await import("@/lib/migrations/jobnimbus-mapper");

    const jnJob = {
      jnid: "job-456",
      number: 1001,
      name: "Roof Repair Project",
      status_name: "In Progress",
      description: "Full roof replacement",
      sales_rep: "rep-1",
      sales_rep_name: "Jane Smith",
      location: {
        address_line1: "456 Oak Ave",
        address_line2: null,
        city: "Scottsdale",
        state_text: "AZ",
        zip: "85251",
        country: "USA",
        geo: { lat: 33.4942, lon: -111.9261 },
      },
      related: ["contact-123"],
      date_created: 1700000000,
      date_updated: 1700100000,
      date_start: 1699900000,
      date_end: null,
      approved_estimate_total: 15000,
      approved_estimate_subtotal: 14000,
    };

    const mapped = mapJob(jnJob);

    expect(mapped.externalId).toBe("job-456");
    expect(mapped.claimNumber).toBe("JN-1001");
    expect(mapped.projectName).toBe("Roof Repair Project");
    expect(mapped.status).toBe("IN_PROGRESS");
    expect(mapped.addressCity).toBe("Scottsdale");
    expect(mapped.latitude).toBe(33.4942);
    expect(mapped.estimateTotal).toBe(15000);
    expect(mapped.assignedTo).toBe("Jane Smith");
    expect(mapped.relatedContactIds).toEqual(["contact-123"]);
  });

  it("should map tasks correctly", async () => {
    const { mapTask } = await import("@/lib/migrations/jobnimbus-mapper");

    const jnTask = {
      jnid: "task-789",
      title: "Schedule inspection",
      description: "Contact homeowner to schedule",
      type: "CALL",
      is_completed: false,
      date_due: 1700500000,
      date_completed: null,
      related: ["job-456"],
      date_created: 1700000000,
      date_updated: 1700100000,
    };

    const mapped = mapTask(jnTask);

    expect(mapped.externalId).toBe("task-789");
    expect(mapped.title).toBe("Schedule inspection");
    expect(mapped.type).toBe("CALL");
    expect(mapped.isCompleted).toBe(false);
    expect(mapped.relatedJobIds).toEqual(["job-456"]);
  });

  it("should map files correctly", async () => {
    const { mapFile } = await import("@/lib/migrations/jobnimbus-mapper");

    const jnFile = {
      jnid: "file-001",
      filename: "damage-photo.jpg",
      description: "Front yard damage",
      url: "https://jobnimbus.com/files/123",
      content_type: "image/jpeg",
      related: ["job-456"],
      date_created: 1700000000,
    };

    const mapped = mapFile(jnFile);

    expect(mapped.externalId).toBe("file-001");
    expect(mapped.filename).toBe("damage-photo.jpg");
    expect(mapped.sourceUrl).toBe("https://jobnimbus.com/files/123");
    expect(mapped.contentType).toBe("image/jpeg");
  });

  it("should skip activities without notes", async () => {
    const { mapActivity } = await import("@/lib/migrations/jobnimbus-mapper");

    const emptyActivity = {
      jnid: "act-001",
      type: "LOG",
      note: null,
      related: ["job-456"],
      date_created: 1700000000,
    };

    const mapped = mapActivity(emptyActivity);
    expect(mapped).toBeNull();
  });

  it("should map activities with notes", async () => {
    const { mapActivity } = await import("@/lib/migrations/jobnimbus-mapper");

    const activity = {
      jnid: "act-002",
      type: "NOTE",
      note: "Spoke with homeowner about timeline",
      related: ["job-456"],
      date_created: 1700000000,
    };

    const mapped = mapActivity(activity);
    expect(mapped).not.toBeNull();
    expect(mapped!.content).toBe("Spoke with homeowner about timeline");
    expect(mapped!.type).toBe("NOTE");
  });
});

// ============================================================================
// Status Mapping Tests
// ============================================================================

describe("Status Mapping", () => {
  it("should map various JobNimbus statuses correctly", async () => {
    const { mapJob } = await import("@/lib/migrations/jobnimbus-mapper");

    const testCases = [
      { input: "lead", expected: "NEW" },
      { input: "new lead", expected: "NEW" },
      { input: "contacted", expected: "CONTACTED" },
      { input: "scheduled", expected: "SCHEDULED" },
      { input: "in progress", expected: "IN_PROGRESS" },
      { input: "work complete", expected: "COMPLETE" },
      { input: "completed", expected: "COMPLETE" },
      { input: "closed", expected: "CLOSED" },
      { input: "won", expected: "WON" },
      { input: "lost", expected: "LOST" },
      { input: "on_hold", expected: "ON_HOLD" },
      { input: "unknown_status", expected: "UNKNOWN" },
    ];

    for (const { input, expected } of testCases) {
      const job = {
        jnid: "test",
        number: 1,
        name: "Test",
        status_name: input,
        description: null,
        sales_rep: null,
        sales_rep_name: null,
        location: null,
        related: [],
        date_created: 1700000000,
        date_updated: 1700000000,
        date_start: null,
        date_end: null,
        approved_estimate_total: null,
        approved_estimate_subtotal: null,
      };

      const mapped = mapJob(job);
      expect(mapped.status).toBe(expected);
    }
  });
});

// ============================================================================
// Batch Mapping Tests
// ============================================================================

describe("Batch Mapping", () => {
  it("should map all data types together", async () => {
    const { mapAllData } = await import("@/lib/migrations/jobnimbus-mapper");

    const contacts = [
      {
        jnid: "c1",
        first_name: "Test",
        last_name: "User",
        email: "test@test.com",
        home_phone: null,
        mobile_phone: null,
        work_phone: null,
        address_line1: null,
        address_line2: null,
        city: null,
        state_text: null,
        zip: null,
        country: null,
        date_created: 1700000000,
        date_updated: 1700000000,
      },
    ];

    const jobs = [
      {
        jnid: "j1",
        number: 1,
        name: "Job 1",
        status_name: "new",
        description: null,
        sales_rep: null,
        sales_rep_name: null,
        location: null,
        related: ["c1"],
        date_created: 1700000000,
        date_updated: 1700000000,
        date_start: null,
        date_end: null,
        approved_estimate_total: null,
        approved_estimate_subtotal: null,
      },
    ];

    const result = mapAllData(contacts, jobs, [], [], []);

    expect(result.leads).toHaveLength(1);
    expect(result.claims).toHaveLength(1);
    expect(result.tasks).toHaveLength(0);
    expect(result.documents).toHaveLength(0);
    expect(result.notes).toHaveLength(0);
    expect(result.stats.contactsProcessed).toBe(1);
    expect(result.stats.jobsProcessed).toBe(1);
  });
});
