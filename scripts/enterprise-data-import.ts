#!/usr/bin/env node
/**
 * Enterprise Data Import CLI
 *
 * Imports CSV data from AccuLynx, JobNimbus, CompanyCam, Xactimate,
 * or generic CSV format into SkaiScraper.
 *
 * Import order (respects FK constraints):
 *   1. Contacts
 *   2. Properties
 *   3. Claims
 *   4. Leads
 *
 * Usage:
 *   npx tsx scripts/enterprise-data-import.ts \
 *     --org <orgId> \
 *     --source acculynx \
 *     --contacts ./data/contacts.csv \
 *     --properties ./data/properties.csv \
 *     --claims ./data/claims.csv \
 *     --leads ./data/leads.csv \
 *     --dry-run
 *
 * Options:
 *   --org           Organization ID (required)
 *   --source        Source system: acculynx | jobnimbus | companycam | xactimate | generic
 *   --contacts      Path to contacts CSV
 *   --properties    Path to properties CSV
 *   --claims        Path to claims CSV
 *   --leads         Path to leads CSV
 *   --dry-run       Preview without inserting (default: true)
 *   --batch-size    Records per batch (default: 500)
 *   --verbose       Show per-record details
 */

import { randomUUID } from "crypto";
import { parse } from "csv-parse";
import { createReadStream } from "fs";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImportOptions {
  orgId: string;
  source: string;
  contactsPath?: string;
  propertiesPath?: string;
  claimsPath?: string;
  leadsPath?: string;
  dryRun: boolean;
  batchSize: number;
  verbose: boolean;
}

interface ImportResult {
  entity: string;
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  errorDetails: Array<{ row: number; field: string; message: string }>;
  durationMs: number;
}

interface ColumnMap {
  [csvColumn: string]: string; // csv header → prisma field
}

// ─── Column Mappings by Source ───────────────────────────────────────────────

const CONTACT_MAPS: Record<string, ColumnMap> = {
  acculynx: {
    "First Name": "firstName",
    "Last Name": "lastName",
    Email: "email",
    Phone: "phone",
    Mobile: "phone",
    Company: "company",
    Address: "street",
    City: "city",
    State: "state",
    Zip: "zip",
    "AccuLynx ID": "externalId",
  },
  jobnimbus: {
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    phone: "phone",
    mobile_phone: "phone",
    company_name: "company",
    address_line_1: "street",
    city: "city",
    state: "state",
    zip: "zip",
    id: "externalId",
  },
  companycam: {
    contact_first_name: "firstName",
    contact_last_name: "lastName",
    contact_email: "email",
    contact_phone: "phone",
    company: "company",
    address: "street",
    city: "city",
    state: "state",
    zip: "zip",
    project_id: "externalId",
  },
  generic: {
    first_name: "firstName",
    last_name: "lastName",
    firstName: "firstName",
    lastName: "lastName",
    email: "email",
    phone: "phone",
    company: "company",
    address: "street",
    street: "street",
    city: "city",
    state: "state",
    zip: "zip",
    zipcode: "zip",
    external_id: "externalId",
    id: "externalId",
  },
};

const PROPERTY_MAPS: Record<string, ColumnMap> = {
  acculynx: {
    "Property Address": "street",
    City: "city",
    State: "state",
    Zip: "zip",
    "Property Type": "propertyType",
    "Year Built": "yearBuilt",
    "Square Footage": "squareFootage",
    "Roof Type": "roofMaterial",
    "Roof Age": "roofAge",
    "Contact Email": "_contactEmail", // Used to link to contact
    "AccuLynx ID": "externalId",
  },
  jobnimbus: {
    address_line_1: "street",
    city: "city",
    state: "state",
    zip: "zip",
    property_type: "propertyType",
    year_built: "yearBuilt",
    square_footage: "squareFootage",
    contact_email: "_contactEmail",
    id: "externalId",
  },
  generic: {
    address: "street",
    street: "street",
    city: "city",
    state: "state",
    zip: "zip",
    property_type: "propertyType",
    propertyType: "propertyType",
    year_built: "yearBuilt",
    yearBuilt: "yearBuilt",
    sqft: "squareFootage",
    square_footage: "squareFootage",
    roof_material: "roofMaterial",
    roof_age: "roofAge",
    contact_email: "_contactEmail",
    external_id: "externalId",
    id: "externalId",
  },
};

const CLAIM_MAPS: Record<string, ColumnMap> = {
  acculynx: {
    "Claim Number": "claimNumber",
    "Insurance Carrier": "insuranceCarrier",
    "Policy Number": "policy_number",
    "Date of Loss": "dateOfLoss",
    "Type of Loss": "damageType",
    Status: "status",
    "Estimated Value": "estimatedValue",
    "Approved Value": "approvedValue",
    Deductible: "deductible",
    Description: "description",
    "Property Address": "_propertyAddress", // Used to link to property
    "AccuLynx ID": "externalId",
  },
  xactimate: {
    ClaimNumber: "claimNumber",
    Carrier: "insuranceCarrier",
    PolicyNumber: "policy_number",
    LossDate: "dateOfLoss",
    LossType: "damageType",
    Status: "status",
    RCV: "estimatedValue",
    ACV: "approvedValue",
    Deductible: "deductible",
    PropertyAddress: "_propertyAddress",
    XactimateId: "externalId",
  },
  generic: {
    claim_number: "claimNumber",
    claimNumber: "claimNumber",
    insurance_carrier: "insuranceCarrier",
    carrier: "insuranceCarrier",
    policy_number: "policy_number",
    date_of_loss: "dateOfLoss",
    dateOfLoss: "dateOfLoss",
    damage_type: "damageType",
    type_of_loss: "damageType",
    status: "status",
    estimated_value: "estimatedValue",
    approved_value: "approvedValue",
    deductible: "deductible",
    description: "description",
    property_address: "_propertyAddress",
    address: "_propertyAddress",
    external_id: "externalId",
    id: "externalId",
  },
};

const LEAD_MAPS: Record<string, ColumnMap> = {
  acculynx: {
    "Lead Name": "title",
    Source: "source",
    Stage: "status",
    Temperature: "temperature",
    Value: "value",
    Description: "description",
    "Contact Email": "_contactEmail",
    "AccuLynx ID": "externalId",
  },
  jobnimbus: {
    name: "title",
    source: "source",
    status: "status",
    estimated_value: "value",
    description: "description",
    contact_email: "_contactEmail",
    id: "externalId",
  },
  generic: {
    title: "title",
    name: "title",
    source: "source",
    status: "status",
    stage: "status",
    temperature: "temperature",
    value: "value",
    description: "description",
    contact_email: "_contactEmail",
    external_id: "externalId",
    id: "externalId",
  },
};

// ─── CSV Parser ──────────────────────────────────────────────────────────────

async function parseCSV(filePath: string): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const rows: Record<string, string>[] = [];
    createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true, // Handle BOM from Excel exports
        })
      )
      .on("data", (row: Record<string, string>) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function mapRow(row: Record<string, string>, columnMap: ColumnMap): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};
  for (const [csvCol, prismaField] of Object.entries(columnMap)) {
    if (row[csvCol] !== undefined && row[csvCol] !== "") {
      mapped[prismaField] = row[csvCol];
    }
  }
  return mapped;
}

// ─── Validators ──────────────────────────────────────────────────────────────

function validateContact(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.firstName || typeof data.firstName !== "string") errors.push("firstName is required");
  if (!data.lastName || typeof data.lastName !== "string") errors.push("lastName is required");
  if (data.email && typeof data.email === "string" && !data.email.includes("@")) {
    errors.push("email is invalid");
  }
  if (data.state && typeof data.state === "string" && data.state.length !== 2) {
    errors.push("state must be 2 characters");
  }
  return { valid: errors.length === 0, errors };
}

function validateProperty(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.street || typeof data.street !== "string") errors.push("street/address is required");
  if (!data.city || typeof data.city !== "string") errors.push("city is required");
  if (!data.state || typeof data.state !== "string") errors.push("state is required");
  if (!data.zip || typeof data.zip !== "string") errors.push("zip is required");
  if (data.yearBuilt) data.yearBuilt = parseInt(data.yearBuilt as string, 10);
  if (data.squareFootage) data.squareFootage = parseInt(data.squareFootage as string, 10);
  if (data.roofAge) data.roofAge = parseInt(data.roofAge as string, 10);
  return { valid: errors.length === 0, errors };
}

function validateClaim(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.claimNumber || typeof data.claimNumber !== "string")
    errors.push("claimNumber is required");
  if (data.estimatedValue) data.estimatedValue = parseInt(data.estimatedValue as string, 10);
  if (data.approvedValue) data.approvedValue = parseInt(data.approvedValue as string, 10);
  if (data.deductible) data.deductible = parseInt(data.deductible as string, 10);
  if (data.dateOfLoss && typeof data.dateOfLoss === "string") {
    const parsed = new Date(data.dateOfLoss);
    if (isNaN(parsed.getTime())) errors.push("dateOfLoss is invalid");
    else data.dateOfLoss = parsed;
  }
  return { valid: errors.length === 0, errors };
}

function validateLead(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title || typeof data.title !== "string") errors.push("title/name is required");
  const validStatuses = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  if (
    data.status &&
    typeof data.status === "string" &&
    !validStatuses.includes(data.status.toLowerCase())
  ) {
    data.status = "new"; // Default invalid statuses
  }
  if (data.value) data.value = parseInt(data.value as string, 10);
  return { valid: errors.length === 0, errors };
}

// ─── Import Engine ───────────────────────────────────────────────────────────

async function importEntity(
  entityName: string,
  filePath: string,
  columnMap: ColumnMap,
  validate: (data: Record<string, unknown>) => { valid: boolean; errors: string[] },
  options: ImportOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insertFn: (batch: any[]) => Promise<number>
): Promise<ImportResult> {
  const start = Date.now();
  const result: ImportResult = {
    entity: entityName,
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [],
    durationMs: 0,
  };

  console.log(`\n📥 Importing ${entityName} from ${filePath}...`);

  const rows = await parseCSV(filePath);
  result.total = rows.length;
  console.log(`   Found ${rows.length} rows`);

  const batch: Record<string, unknown>[] = [];

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapRow(rows[i], columnMap);
    const { valid, errors } = validate(mapped);

    if (!valid) {
      result.errors++;
      for (const err of errors) {
        result.errorDetails.push({ row: i + 2, field: err.split(" ")[0], message: err });
      }
      if (options.verbose) {
        console.log(`   ❌ Row ${i + 2}: ${errors.join(", ")}`);
      }
      continue;
    }

    // Add org scoping and metadata
    mapped.id = randomUUID();
    mapped.orgId = options.orgId;
    mapped.externalSource = options.source;
    mapped.createdAt = new Date();
    mapped.updatedAt = new Date();

    batch.push(mapped);

    // Flush batch
    if (batch.length >= options.batchSize) {
      if (options.dryRun) {
        console.log(`   🔍 [DRY RUN] Would insert ${batch.length} ${entityName}`);
        result.imported += batch.length;
      } else {
        const inserted = await insertFn([...batch]);
        result.imported += inserted;
        console.log(
          `   ✅ Inserted ${inserted} ${entityName} (batch ${Math.ceil(i / options.batchSize)})`
        );
      }
      batch.length = 0;
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    if (options.dryRun) {
      console.log(`   🔍 [DRY RUN] Would insert ${batch.length} ${entityName}`);
      result.imported += batch.length;
    } else {
      const inserted = await insertFn([...batch]);
      result.imported += inserted;
      console.log(`   ✅ Inserted ${inserted} ${entityName} (final batch)`);
    }
  }

  result.skipped = result.total - result.imported - result.errors;
  result.durationMs = Date.now() - start;

  return result;
}

// ─── CLI Argument Parser ─────────────────────────────────────────────────────

function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    orgId: "",
    source: "generic",
    dryRun: true,
    batchSize: 500,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--org":
        options.orgId = args[++i];
        break;
      case "--source":
        options.source = args[++i];
        break;
      case "--contacts":
        options.contactsPath = args[++i];
        break;
      case "--properties":
        options.propertiesPath = args[++i];
        break;
      case "--claims":
        options.claimsPath = args[++i];
        break;
      case "--leads":
        options.leadsPath = args[++i];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--execute":
        options.dryRun = false;
        break;
      case "--batch-size":
        options.batchSize = parseInt(args[++i], 10);
        break;
      case "--verbose":
        options.verbose = true;
        break;
    }
  }

  if (!options.orgId) {
    console.error("❌ --org <orgId> is required");
    process.exit(1);
  }

  if (
    !options.contactsPath &&
    !options.propertiesPath &&
    !options.claimsPath &&
    !options.leadsPath
  ) {
    console.error(
      "❌ At least one data file is required (--contacts, --properties, --claims, or --leads)"
    );
    process.exit(1);
  }

  return options;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const options = parseArgs();
  const results: ImportResult[] = [];

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║          SkaiScraper Enterprise Data Import                 ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log(`\n  Organization: ${options.orgId}`);
  console.log(`  Source:       ${options.source}`);
  console.log(
    `  Mode:         ${options.dryRun ? "🔍 DRY RUN (preview only)" : "⚡ LIVE (will insert data)"}`
  );
  console.log(`  Batch Size:   ${options.batchSize}`);

  // Dynamic import of Prisma (only needed for live mode)
  let prisma: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!options.dryRun) {
    try {
      const prismaModule = await import("@/lib/prisma");
      prisma = prismaModule.default;
    } catch {
      // Fallback for running outside Next.js context
      const { PrismaClient } = await import("@prisma/client");
      prisma = new PrismaClient();
    }
  }

  // Verify org exists
  if (prisma) {
    const org = await prisma.org.findUnique({ where: { id: options.orgId } });
    if (!org) {
      console.error(`\n❌ Organization ${options.orgId} not found in database`);
      process.exit(1);
    }
    console.log(`  Org Name:     ${org.name}`);
  }

  const sourceKey = options.source in CONTACT_MAPS ? options.source : "generic";

  // ─── Import Order: Contacts → Properties → Claims → Leads ─────────────

  // 1. Contacts
  if (options.contactsPath) {
    const result = await importEntity(
      "contacts",
      options.contactsPath,
      CONTACT_MAPS[sourceKey] || CONTACT_MAPS.generic,
      validateContact,
      options,
      async (batch) => {
        if (!prisma) return batch.length;
        const created = await prisma.$transaction(
          batch.map((record: Record<string, unknown>) =>
            prisma.contact.create({
              data: record,
            })
          )
        );
        return created.length;
      }
    );
    results.push(result);
  }

  // 2. Properties
  if (options.propertiesPath) {
    const result = await importEntity(
      "properties",
      options.propertiesPath,
      PROPERTY_MAPS[sourceKey] || PROPERTY_MAPS.generic,
      validateProperty,
      options,
      async (batch) => {
        if (!prisma) return batch.length;
        // Resolve contact links
        for (const record of batch) {
          if (record._contactEmail) {
            const contact = await prisma.contact.findFirst({
              where: { orgId: options.orgId, email: record._contactEmail as string },
            });
            if (contact) {
              record.contactId = contact.id;
            }
            delete record._contactEmail;
          }
          if (!record.contactId) {
            // Create a placeholder contact
            const placeholder = await prisma.contact.create({
              data: {
                id: randomUUID(),
                orgId: options.orgId,
                firstName: "Property",
                lastName: "Owner",
                externalSource: options.source,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            record.contactId = placeholder.id;
          }
          if (!record.propertyType) record.propertyType = "residential";
          record.name = record.street || "Imported Property";
        }
        const created = await prisma.$transaction(
          batch.map((record: Record<string, unknown>) => prisma.property.create({ data: record }))
        );
        return created.length;
      }
    );
    results.push(result);
  }

  // 3. Claims
  if (options.claimsPath) {
    const result = await importEntity(
      "claims",
      options.claimsPath,
      CLAIM_MAPS[sourceKey] || CLAIM_MAPS.generic,
      validateClaim,
      options,
      async (batch) => {
        if (!prisma) return batch.length;
        for (const record of batch) {
          // Resolve property link by address
          if (record._propertyAddress) {
            const property = await prisma.property.findFirst({
              where: { orgId: options.orgId, street: record._propertyAddress as string },
            });
            if (property) {
              record.propertyId = property.id;
            }
            delete record._propertyAddress;
          }
          if (!record.propertyId) {
            console.log(`   ⚠️ Claim ${record.claimNumber}: no matching property found, skipping`);
            continue;
          }
          if (!record.status) record.status = "new";
          if (!record.priority) record.priority = "medium";
          if (!record.description) record.description = `Imported from ${options.source}`;
        }
        const validBatch = batch.filter((r: Record<string, unknown>) => r.propertyId);
        if (validBatch.length === 0) return 0;
        const created = await prisma.$transaction(
          validBatch.map((record: Record<string, unknown>) => prisma.claim.create({ data: record }))
        );
        return created.length;
      }
    );
    results.push(result);
  }

  // 4. Leads
  if (options.leadsPath) {
    const result = await importEntity(
      "leads",
      options.leadsPath,
      LEAD_MAPS[sourceKey] || LEAD_MAPS.generic,
      validateLead,
      options,
      async (batch) => {
        if (!prisma) return batch.length;
        for (const record of batch) {
          // Resolve contact link
          if (record._contactEmail) {
            const contact = await prisma.contact.findFirst({
              where: { orgId: options.orgId, email: record._contactEmail as string },
            });
            if (contact) {
              record.contactId = contact.id;
            }
            delete record._contactEmail;
          }
          if (!record.contactId) {
            const placeholder = await prisma.contact.create({
              data: {
                id: randomUUID(),
                orgId: options.orgId,
                firstName: "Lead",
                lastName: "Contact",
                externalSource: options.source,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            });
            record.contactId = placeholder.id;
          }
          if (!record.source) record.source = options.source;
          if (!record.temperature) record.temperature = "warm";
        }
        const created = await prisma.$transaction(
          batch.map((record: Record<string, unknown>) => prisma.lead.create({ data: record }))
        );
        return created.length;
      }
    );
    results.push(result);
  }

  // ─── Migration Report ──────────────────────────────────────────────────

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║                    Migration Report                         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  let totalImported = 0;
  let totalErrors = 0;

  for (const r of results) {
    const emoji = r.errors === 0 ? "✅" : r.errors < r.total * 0.05 ? "⚠️" : "❌";
    console.log(
      `  ${emoji} ${r.entity.padEnd(12)} | Total: ${String(r.total).padStart(6)} | Imported: ${String(r.imported).padStart(6)} | Errors: ${String(r.errors).padStart(4)} | ${r.durationMs}ms`
    );
    totalImported += r.imported;
    totalErrors += r.errors;

    if (r.errorDetails.length > 0 && r.errorDetails.length <= 20) {
      for (const err of r.errorDetails) {
        console.log(`     └─ Row ${err.row}: ${err.message}`);
      }
    } else if (r.errorDetails.length > 20) {
      console.log(`     └─ ... and ${r.errorDetails.length - 20} more errors`);
    }
  }

  console.log(`\n  ─────────────────────────────────────────────────`);
  console.log(`  Total imported: ${totalImported} records`);
  console.log(`  Total errors:   ${totalErrors} records`);
  console.log(`  Mode:           ${options.dryRun ? "DRY RUN (no data was written)" : "LIVE"}`);

  if (options.dryRun) {
    console.log(`\n  💡 To execute the import, re-run with --execute instead of --dry-run`);
  }

  // Cleanup
  if (prisma && prisma.$disconnect) {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\n❌ Import failed:", err.message);
  process.exit(1);
});
