import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

/**
 * PUT /api/finance/commission-plans/[id] — Update a plan
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.commission_plans.findFirst({
      where: { id, org_id: ctx.orgId },
    });
    if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    // If setting as default, unset others
    if (body.isDefault) {
      await prisma.commission_plans.updateMany({
        where: { org_id: ctx.orgId, is_default: true, id: { not: id } },
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
    console.error("[API] commission-plans PUT error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/finance/commission-plans/[id] — Delete a plan
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.commission_plans.findFirst({
      where: { id, org_id: ctx.orgId },
    });
    if (!existing) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    await prisma.commission_plans.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[API] commission-plans DELETE error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
