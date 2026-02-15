/**
 * DATABASE SCHEMA VALIDATION ENDPOINT
 *
 * PUBLIC ROUTE - Checks if required tables exist
 * Uses raw SQL to verify schema without depending on Prisma models
 *
 * NEVER THROWS - always returns JSON
 */

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function blockInProd() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const blocked = blockInProd();
  if (blocked) return blocked;

  const timestamp = new Date().toISOString();

  try {
    const requiredTables = [
      "organizations", // Org model maps to this table
      "user_organizations",
      "claims", // Claim model (check your schema for actual name)
    ];

    const results: any = {};
    let allTablesExist = true;

    for (const tableName of requiredTables) {
      try {
        // Try to query table existence using information_schema
        const result: any = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = ${tableName}
          ) as exists
        `;

        const exists = result[0]?.exists || false;
        results[tableName] = {
          exists,
          status: exists ? "✅ OK" : "❌ MISSING",
        };

        if (!exists) allTablesExist = false;
      } catch (error: any) {
        results[tableName] = {
          exists: false,
          status: "❌ ERROR",
          error: error.message,
        };
        allTablesExist = false;
      }
    }

    // Additional checks
    let canConnect = false;
    let dbHost = "unknown";

    try {
      await prisma.$queryRaw`SELECT 1`;
      canConnect = true;

      const dbUrl = process.env.DATABASE_URL || "";
      const match = dbUrl.match(/@([^/:]+)/);
      dbHost = match ? match[1] : "localhost";
    } catch (error: any) {
      results._connectionError = error.message;
    }

    return NextResponse.json({
      ok: allTablesExist,
      timestamp,
      schemaStatus: allTablesExist ? "HEALTHY" : "MISSING_TABLES",
      database: {
        host: dbHost,
        canConnect,
      },
      tables: results,
      message: allTablesExist
        ? "All required tables exist"
        : "Some required tables are missing - run migrations",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        timestamp,
        reason: "DB_CHECK_FAILED",
        error: error.message,
        stack: error.stack?.split("\n").slice(0, 3),
      },
      { status: 200 }
    );
  }
}
