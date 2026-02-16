import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

import { compose, safeAuth, withOrgScope, withRateLimit, withSentryApi } from "@/lib/api/wrappers";
import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

/**
 * GET /api/vendors/search
 * Search vendors by name, specialty, or other filters
 * Query params:
 * - q: search query (searches businessName, specialties)
 * - specialty: filter by specialty
 * - limit: max results (default 50)
 * - offset: pagination offset (default 0)
 */
const baseGET = async (req: NextRequest) => {
  const { orgId } = await getCurrentUserPermissions();
  if (!orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const specialty = searchParams.get("specialty");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = parseInt(searchParams.get("offset") || "0");

  // Build where clause
  const where: any = { orgId };

  if (query) {
    // Search in businessName (case-insensitive)
    where.OR = [
      {
        businessName: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        specialties: {
          has: query,
        },
      },
    ];
  }

  if (specialty) {
    // Filter by specialty
    where.specialties = {
      has: specialty,
    };
  }

  try {
    const [vendors, total] = await Promise.all([
      prisma.contractors.findMany({
        where,
        orderBy: { company_name: "asc" },
        take: limit,
        skip: offset,
      }),
      prisma.contractors.count({ where }),
    ]);

    return NextResponse.json({
      vendors,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + vendors.length < total,
      },
    });
  } catch (error) {
    logger.error("[vendors/search] Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
};

const wrap = compose(withSentryApi, withRateLimit, withOrgScope, safeAuth);
export const GET = wrap(baseGET);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
