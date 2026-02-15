/**
 * TASK 115: DATA MIGRATION TOOLS
 *
 * Database migration utilities, data transformation, and import/export.
 */

export type MigrationStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "ROLLED_BACK";

export interface Migration {
  id: string;
  name: string;
  description: string;
  status: MigrationStatus;
  version: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface DataTransform {
  field: string;
  transform: (value: unknown) => unknown;
}

/** Dynamic Prisma table delegate for migration operations */
interface PrismaTableDelegate {
  create(args: { data: Record<string, unknown> }): Promise<Record<string, unknown>>;
  findMany(args?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
  update(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteMany(args: Record<string, unknown>): Promise<{ count: number }>;
}

/**
 * Migration manager
 */
export class MigrationManager {
  private migrations: Migration[] = [];
  private executed: Set<string> = new Set();

  /**
   * Register migration
   */
  register(migration: Migration): void {
    this.migrations.push(migration);
  }

  /**
   * Run pending migrations
   */
  async runPending(): Promise<void> {
    const pending = this.migrations.filter(
      (m) => !this.executed.has(m.id) && m.status === "PENDING"
    );

    for (const migration of pending) {
      await this.runMigration(migration);
    }
  }

  /**
   * Run single migration
   */
  async runMigration(migration: Migration): Promise<void> {
    try {
      migration.status = "RUNNING";
      migration.startedAt = new Date();

      await migration.up();

      migration.status = "COMPLETED";
      migration.completedAt = new Date();
      this.executed.add(migration.id);
    } catch (error: unknown) {
      migration.status = "FAILED";
      migration.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Rollback migration
   */
  async rollback(migrationId: string): Promise<void> {
    const migration = this.migrations.find((m) => m.id === migrationId);
    if (!migration) {
      throw new Error("Migration not found");
    }

    try {
      migration.status = "RUNNING";
      await migration.down();
      migration.status = "ROLLED_BACK";
      this.executed.delete(migrationId);
    } catch (error: unknown) {
      migration.status = "FAILED";
      migration.error = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  getStatus(): {
    total: number;
    pending: number;
    completed: number;
    failed: number;
  } {
    return {
      total: this.migrations.length,
      pending: this.migrations.filter((m) => m.status === "PENDING").length,
      completed: this.migrations.filter((m) => m.status === "COMPLETED").length,
      failed: this.migrations.filter((m) => m.status === "FAILED").length,
    };
  }
}

/**
 * Import data from CSV
 */
export async function importFromCSV(
  filePath: string,
  table: string,
  transforms?: DataTransform[]
): Promise<{ imported: number; errors: string[] }> {
  const { prisma } = await import("@/lib/prisma");
  const fs = await import("fs/promises");

  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  let imported = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    try {
      const values = lines[i].split(",").map((v) => v.trim());
      const record: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        let value: unknown = values[index];

        // Apply transforms
        if (transforms) {
          const transform = transforms.find((t) => t.field === header);
          if (transform) {
            value = transform.transform(value);
          }
        }

        record[header] = value;
      });

      // Insert into database
      await (prisma as unknown as Record<string, PrismaTableDelegate>)[table].create({
        data: record,
      });

      imported++;
    } catch (error: unknown) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { imported, errors };
}

/**
 * Export data to CSV
 */
export async function exportToCSV(
  table: string,
  filePath: string,
  where?: Record<string, unknown>
): Promise<{ exported: number }> {
  const { prisma } = await import("@/lib/prisma");
  const fs = await import("fs/promises");

  const records = await (prisma as unknown as Record<string, PrismaTableDelegate>)[table].findMany({
    where,
  });

  if (records.length === 0) {
    return { exported: 0 };
  }

  const headers = Object.keys(records[0]);
  const rows = [headers.join(",")];

  records.forEach((record: Record<string, unknown>) => {
    const values = headers.map((header) => {
      const value = record[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value;
    });
    rows.push(values.join(","));
  });

  await fs.writeFile(filePath, rows.join("\n"));

  return { exported: records.length };
}

/**
 * Bulk update records
 */
export async function bulkUpdate(
  table: string,
  updates: Array<{ id: string; data: Record<string, unknown> }>
): Promise<{ updated: number; errors: string[] }> {
  const { prisma } = await import("@/lib/prisma");

  let updated = 0;
  const errors: string[] = [];

  for (const update of updates) {
    try {
      await (prisma as unknown as Record<string, PrismaTableDelegate>)[table].update({
        where: { id: update.id },
        data: update.data,
      });
      updated++;
    } catch (error: unknown) {
      errors.push(`ID ${update.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { updated, errors };
}

/**
 * Bulk delete records
 */
export async function bulkDelete(table: string, ids: string[]): Promise<{ deleted: number }> {
  const { prisma } = await import("@/lib/prisma");

  const result = await (prisma as unknown as Record<string, PrismaTableDelegate>)[table].deleteMany(
    {
      where: {
        id: { in: ids },
      },
    }
  );

  return { deleted: result.count };
}

/**
 * Transform data
 */
export function transformData(
  data: Record<string, unknown>[],
  transforms: DataTransform[]
): Record<string, unknown>[] {
  return data.map((record) => {
    const transformed = { ...record };

    transforms.forEach(({ field, transform }) => {
      if (field in transformed) {
        transformed[field] = transform(transformed[field]);
      }
    });

    return transformed;
  });
}

/**
 * Validate data
 */
export function validateData(
  data: Record<string, unknown>[],
  schema: Record<string, (value: unknown) => boolean>
): { valid: Record<string, unknown>[]; invalid: Record<string, unknown>[] } {
  const valid: Record<string, unknown>[] = [];
  const invalid: Record<string, unknown>[] = [];

  data.forEach((record) => {
    let isValid = true;

    for (const [field, validator] of Object.entries(schema)) {
      if (!validator(record[field])) {
        isValid = false;
        break;
      }
    }

    if (isValid) {
      valid.push(record);
    } else {
      invalid.push(record);
    }
  });

  return { valid, invalid };
}

/**
 * Migrate data between tables
 */
export async function migrateTable(
  sourceTable: string,
  targetTable: string,
  transforms?: DataTransform[]
): Promise<{ migrated: number; errors: string[] }> {
  const { prisma } = await import("@/lib/prisma");

  const records = await (prisma as unknown as Record<string, PrismaTableDelegate>)[
    sourceTable
  ].findMany();

  let migrated = 0;
  const errors: string[] = [];

  for (const record of records) {
    try {
      let data = { ...record };
      delete data.id; // Remove source ID

      // Apply transforms
      if (transforms) {
        transforms.forEach(({ field, transform }) => {
          if (field in data) {
            data[field] = transform(data[field]);
          }
        });
      }

      await (prisma as unknown as Record<string, PrismaTableDelegate>)[targetTable].create({
        data,
      });
      migrated++;
    } catch (error: unknown) {
      errors.push(
        `Record ${String(record.id)}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return { migrated, errors };
}

/**
 * Create backup
 */
export async function createBackup(tables: string[]): Promise<{ path: string; size: number }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `/tmp/backup-${timestamp}.json`;
  const fs = await import("fs/promises");
  const { prisma } = await import("@/lib/prisma");

  const backup: Record<string, Record<string, unknown>[]> = {};

  for (const table of tables) {
    backup[table] = await (prisma as unknown as Record<string, PrismaTableDelegate>)[
      table
    ].findMany();
  }

  const content = JSON.stringify(backup, null, 2);
  await fs.writeFile(backupPath, content);

  const stats = await fs.stat(backupPath);

  return {
    path: backupPath,
    size: stats.size,
  };
}

/**
 * Restore from backup
 */
export async function restoreFromBackup(
  backupPath: string
): Promise<{ restored: Record<string, number> }> {
  const fs = await import("fs/promises");
  const { prisma } = await import("@/lib/prisma");

  const content = await fs.readFile(backupPath, "utf-8");
  const backup = JSON.parse(content);

  const restored: Record<string, number> = {};

  for (const [table, records] of Object.entries(backup)) {
    let count = 0;
    for (const record of records as Record<string, unknown>[]) {
      await (prisma as unknown as Record<string, PrismaTableDelegate>)[table].create({
        data: record,
      });
      count++;
    }
    restored[table] = count;
  }

  return { restored };
}

/**
 * Data quality check
 */
export async function checkDataQuality(table: string): Promise<{
  total: number;
  nulls: Record<string, number>;
  duplicates: number;
}> {
  const { prisma } = await import("@/lib/prisma");

  const records = await (prisma as unknown as Record<string, PrismaTableDelegate>)[
    table
  ].findMany();
  const total = records.length;

  const nulls: Record<string, number> = {};
  const seen = new Set<string>();
  let duplicates = 0;

  records.forEach((record: Record<string, unknown>) => {
    // Check for nulls
    Object.entries(record).forEach(([key, value]) => {
      if (value === null) {
        nulls[key] = (nulls[key] || 0) + 1;
      }
    });

    // Check for duplicates
    const key = JSON.stringify(record);
    if (seen.has(key)) {
      duplicates++;
    } else {
      seen.add(key);
    }
  });

  return { total, nulls, duplicates };
}
