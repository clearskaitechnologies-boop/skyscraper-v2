export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

import { apiError, apiOk } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

// ---------------------------------------------------------------------------
// GET  /api/crews — List crew schedules for the org
// POST /api/crews — Schedule a new crew assignment
// ---------------------------------------------------------------------------

const CreateCrewSchema = z.object({
  claimId: z.string(),
  crewLeadId: z.string(),
  crewMemberIds: z.array(z.string()).default([]),
  scheduledDate: z.string(),
  startTime: z.string(),
  estimatedDuration: z.number().min(1),
  complexity: z.enum(["low", "medium", "high"]).default("medium"),
  scopeOfWork: z.string().optional().nullable(),
  specialInstructions: z.string().optional().nullable(),
  safetyNotes: z.string().optional().nullable(),
  accessInstructions: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return apiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const crewLeadId = url.searchParams.get("crewLeadId");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");

    const where: any = { orgId: ctx.orgId };
    if (status) where.status = status;
    if (crewLeadId) where.crewLeadId = crewLeadId;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduledDate.lte = new Date(dateTo);
    }

    const schedules = await prisma.crewSchedule.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
      take: 200,
      include: {
        claims: { select: { id: true, claimNumber: true, title: true } },
        users: { select: { id: true, name: true, email: true, headshot_url: true } },
      },
    });

    // Get all crew member details
    const allMemberIds = [...new Set(schedules.flatMap((s) => s.crewMemberIds))];
    const members =
      allMemberIds.length > 0
        ? await prisma.users.findMany({
            where: { id: { in: allMemberIds } },
            select: { id: true, name: true, email: true, headshot_url: true },
          })
        : [];
    const membersMap = new Map(members.map((m) => [m.id, m]));

    const enriched = schedules.map((s) => ({
      ...s,
      crewMembers: s.crewMemberIds.map((id) => membersMap.get(id) ?? { id, name: null }),
    }));

    const summary = {
      total: schedules.length,
      scheduled: schedules.filter((s) => s.status === "scheduled").length,
      inProgress: schedules.filter((s) => s.status === "in_progress").length,
      completed: schedules.filter((s) => s.status === "completed").length,
      cancelled: schedules.filter((s) => s.status === "cancelled").length,
    };

    return apiOk({ schedules: enriched, summary });
  } catch (err: any) {
    logger.error("[crews-get]", err);
    return apiError(500, "INTERNAL_ERROR", err.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return apiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const body = await req.json().catch(() => null);
    if (!body) return apiError(400, "INVALID_BODY", "Invalid JSON");

    const parsed = CreateCrewSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Validation failed", parsed.error.errors);
    }
    const data = parsed.data;

    // Verify claim belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: data.claimId, orgId: ctx.orgId },
    });
    if (!claim) {
      return apiError(404, "CLAIM_NOT_FOUND", "Claim not found");
    }

    const schedule = await prisma.crewSchedule.create({
      data: {
        id: crypto.randomUUID(),
        orgId: ctx.orgId,
        claimId: data.claimId,
        crewLeadId: data.crewLeadId,
        crewMemberIds: data.crewMemberIds,
        scheduledDate: new Date(data.scheduledDate),
        startTime: data.startTime,
        estimatedDuration: data.estimatedDuration,
        complexity: data.complexity,
        scopeOfWork: data.scopeOfWork ?? null,
        specialInstructions: data.specialInstructions ?? null,
        safetyNotes: data.safetyNotes ?? null,
        accessInstructions: data.accessInstructions ?? null,
        updatedAt: new Date(),
      },
    });

    return apiOk({ schedule }, { status: 201 });
  } catch (err: any) {
    logger.error("[crews-post]", err);
    return apiError(500, "INTERNAL_ERROR", err.message);
  }
}
