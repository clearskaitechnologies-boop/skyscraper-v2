import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

/**
 * GET /api/finance/commission-plans — List all commission plans for org
 */
export async function GET() {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await prisma.commission_plans.findMany({
      where: { org_id: ctx.orgId },
      orderBy: [{ is_default: "desc" }, { created_at: "desc" }],
    });

    return NextResponse.json({
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        ruleType: p.rule_type,
        structure: p.structure,
        isActive: p.is_active,
        isDefault: p.is_default,
        appliesTo: p.applies_to,
        userIds: p.user_ids,
        createdAt: p.created_at.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("[API] commission-plans GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/finance/commission-plans — Create a new commission plan
 */
export async function POST(req: Request) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, ruleType, structure, isDefault, appliesTo, userIds } = body;

    if (!name || !ruleType || !structure) {
      return NextResponse.json({ error: "name, ruleType, structure required" }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.commission_plans.updateMany({
        where: { org_id: ctx.orgId, is_default: true },
        data: { is_default: false },
      });
    }

    const plan = await prisma.commission_plans.create({
      data: {
        org_id: ctx.orgId,
        name,
        description: description || null,
        rule_type: ruleType,
        structure: structure,
        is_default: isDefault || false,
        applies_to: appliesTo || "all",
        user_ids: userIds || [],
      },
    });

    return NextResponse.json({ success: true, data: { id: plan.id } }, { status: 201 });
  } catch (err: any) {
    console.error("[API] commission-plans POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
