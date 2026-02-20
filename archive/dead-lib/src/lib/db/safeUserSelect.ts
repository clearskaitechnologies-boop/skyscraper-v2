import * as Sentry from "@sentry/nextjs";

import { withDbSpan } from "@/lib/monitoring/dbSpan";
import { incrementDrift } from "@/lib/monitoring/driftMetrics";
import prisma from "@/lib/prisma";

// Simple 60s in-memory cache to reduce repeated fallback noise.
const CACHE_MS = 60_000;
const userCache: Record<string, { at: number; data: any[] }> = {};

export async function safeUserSelect(orgId: string) {
  const cached = userCache[orgId];
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.data;
  }
  // Attempt a superset selection; if schema drift (missing columns) occurs, degrade gracefully.
  try {
    // Ensure underlying snake_case columns exist (self-healing if permissions allow)
    await ensureUserProfileColumns();
    const data = await withDbSpan("users.select.full", () =>
      prisma.users.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          lastSeenAt: true,
          headshotUrl: true,
          phone: true,
          title: true,
          jobHistory: true,
        },
      })
    );
    userCache[orgId] = { at: Date.now(), data };
    return data;
  } catch (err: any) {
    const msg = String(err?.message || "").toLowerCase();
    const drift =
      msg.includes("does not exist") ||
      msg.includes("column") ||
      msg.includes("title") ||
      msg.includes("headshot") ||
      msg.includes("phone") ||
      msg.includes("job_history");
    if (drift) {
      Sentry.addBreadcrumb({
        category: "users",
        level: "warning",
        message: "users.fallback.start",
        data: { orgId },
      });
      incrementDrift("users");
      Sentry.captureMessage("safeUserSelect: schema drift detected; applying fallback", {
        level: "warning",
        contexts: { error: { message: err.message } },
      });
      const data = await withDbSpan("users.select.fallback", () =>
        prisma.users.findMany({
          where: { orgId },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            lastSeenAt: true,
          },
        })
      );
      Sentry.addBreadcrumb({
        category: "users",
        level: "info",
        message: "users.fallback.success",
        data: { count: data.length },
      });
      userCache[orgId] = { at: Date.now(), data };
      return data;
    }
    throw err;
  }
}

// Column self-healing: creates profile columns if missing.
async function ensureUserProfileColumns() {
  try {
    const rows = await prisma.$queryRaw<
      Array<{ column_name: string }>
    >`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
    const present = new Set(rows.map((r) => r.column_name));
    const needed: Array<{ name: string; ddl: string }> = [
      { name: "title", ddl: 'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" TEXT;' },
      { name: "phone", ddl: 'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;' },
      {
        name: "headshot_url",
        ddl: 'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "headshot_url" TEXT;',
      },
      {
        name: "public_skills",
        ddl:
          'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "public_skills" JSONB DEFAULT ' +
          "'[]'" +
          ";",
      },
      {
        name: "job_history",
        ddl:
          'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_history" JSONB DEFAULT ' +
          "'[]'" +
          ";",
      },
      {
        name: "client_testimonials",
        ddl:
          'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "client_testimonials" JSONB DEFAULT ' +
          "'[]'" +
          ";",
      },
      {
        name: "earned_badges",
        ddl:
          'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "earned_badges" JSONB DEFAULT ' +
          "'[]'" +
          ";",
      },
      {
        name: "years_experience",
        ddl: 'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "years_experience" INT DEFAULT 0;',
      },
    ];
    const missing = needed.filter((c) => !present.has(c.name));
    if (missing.length === 0) return;
    for (const m of missing) {
      try {
        // SECURITY NOTE: m.ddl is from hardcoded array above, no user input — $executeRawUnsafe is safe here
        await prisma.$executeRawUnsafe(m.ddl);
      } catch (e: any) {
        Sentry.captureMessage("ensureUserProfileColumns: failed to create column", {
          level: "error",
          contexts: { column: { name: m.name, error: e?.message } },
        });
      }
    }
    if (missing.length > 0) {
      Sentry.captureMessage("ensureUserProfileColumns: added missing columns", {
        level: "info",
        contexts: { added: { columns: missing.map((m) => m.name) } },
      });
    }
  } catch (e: any) {
    Sentry.captureMessage("ensureUserProfileColumns: introspection failed", {
      level: "warning",
      contexts: { error: { message: e?.message } },
    });
  }
}

export function flushUserCache(orgId?: string) {
  if (orgId) delete userCache[orgId];
  else Object.keys(userCache).forEach((k) => delete userCache[k]);
}
