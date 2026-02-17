import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PUT /api/finance/commission-plans/[id] — Update a plan (ADMIN/MANAGER only)
 */
export const PUT = withAuth(
  async (req: NextRequest, { orgId }) => {
    try {
      // Extract route param from URL
      const url = new URL(req.url);
      const id = url.pathname.split("/").filter(Boolean).pop()!;
      const body = await req.json();

      const existing = await prisma.commission_plans.findFirst({
        where: { id, org_id: orgId },
      });
      if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

      // If setting as default, unset others
      if (body.isDefault) {
        await prisma.commission_plans.updateMany({
          where: { org_id: orgId, is_default: true, id: { not: id } },
          data: { is_default: false },
        });
      }

      await prisma.commission_plans.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.ruleType !== undefined && { rule_type: body.ruleType }),
          ...(body.structure !== undefined && { structure: body.structure }),
          ...(body.isActive !== undefined && { is_active: body.isActive }),
          ...(body.isDefault !== undefined && { is_default: body.isDefault }),
          ...(body.appliesTo !== undefined && { applies_to: body.appliesTo }),
          ...(body.userIds !== undefined && { user_ids: body.userIds }),
        },
      });

      return NextResponse.json({ success: true });
    } catch (err: any) {
      logger.error("[API] commission-plans PUT error:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  },
  { roles: ["ADMIN", "MANAGER", "OWNER"] }
);

/**
 * DELETE /api/finance/commission-plans/[id] — Delete a plan (ADMIN only)
 */
export const DELETE = withAuth(
  async (req: NextRequest, { orgId }) => {
    try {
      const url = new URL(req.url);
      const id = url.pathname.split("/").filter(Boolean).pop()!;

      const existing = await prisma.commission_plans.findFirst({
        where: { id, org_id: orgId },
      });
      if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

      await prisma.commission_plans.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (err: any) {
      logger.error("[API] commission-plans DELETE error:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  },
  { roles: ["ADMIN", "OWNER"] }
);
