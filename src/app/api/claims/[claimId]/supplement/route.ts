import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

// Definitive minimal supplement route (legacy code fully removed)
export async function GET(_req: Request, { params }: { params: { claimId: string } }) {
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

  const { userId, orgId } = authResult;
  const claimId = params.claimId;

  if (!claimId) return NextResponse.json({ ok: false, error: "missing-claimId" }, { status: 400 });

  // Verify claim access
  const accessResult = await verifyClaimAccess(claimId, orgId, userId);
  if (accessResult instanceof NextResponse) return accessResult;

  const supplement = await prisma.supplements.findFirst({
    where: { claim_id: claimId, org_id: orgId ?? undefined },
    orderBy: { created_at: "desc" },
    select: { id: true, notes: true, status: true },
  });
  const items = supplement
    ? await prisma.supplement_items.findMany({
        where: { supplement_id: supplement.id },
        select: {
          id: true,
          description: true,
          qty: true,
          unit_price: true,
          total: true,
          status: true,
          justification: true,
        },
        orderBy: { created_at: "asc" },
      })
    : [];
  return NextResponse.json({ ok: true, supplement: supplement || null, items });
}

export async function POST(req: Request, { params }: { params: { claimId: string } }) {
  const ctx = await safeOrgContext();
  if (ctx.status !== "ok" || !ctx.orgId || !ctx.userId)
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const claimId = params.claimId;
  if (!claimId) return NextResponse.json({ ok: false, error: "missing-claimId" }, { status: 400 });
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }
  const { items, justification } = body || {};
  if (!Array.isArray(items) || !items.length)
    return NextResponse.json({ ok: false, error: "no-items" }, { status: 400 });
  const claim = await prisma.claims.findFirst({
    where: { id: claimId, orgId: ctx.orgId },
    select: { id: true, claimNumber: true, dateOfLoss: true },
  });
  if (!claim) return NextResponse.json({ ok: false, error: "claim-not-found" }, { status: 404 });
  const supplementId = randomUUID();
  await prisma.supplements.create({
    data: {
      id: supplementId,
      org_id: ctx.orgId,
      created_by: ctx.userId,
      status: "DRAFT",
      claim_id: claim.id,
      claim_number: claim.claimNumber,
      date_of_loss: claim.dateOfLoss ?? null,
      notes: justification || "",
      subtotal: 0,
      total: 0,
    } as any,
  });
  const prepared = items.map((i: any) => ({
    id: randomUUID(),
    supplement_id: supplementId,
    claimId: claim.id,
    name: (i.description || "Item").substring(0, 120),
    code: i.code || "",
    description: i.description || "",
    category: i.category || null,
    qty: typeof i.qty === "number" ? i.qty : typeof i.quantity === "number" ? i.quantity : 1,
    unit: "EA",
    price_cents: Math.round((i.unitPrice || i.unit_price || 0) * 100),
    unit_price: i.unitPrice || i.unit_price || 0,
    total: i.total || (i.qty || i.quantity || 1) * (i.unitPrice || i.unit_price || 0),
    justification: i.notes || i.justification || "",
    status: i.status === "paid" ? "approved" : i.status === "disputed" ? "disputed" : "requested",
    updated_at: new Date(),
  }));
  if (prepared.length) await prisma.supplement_items.createMany({ data: prepared });

  // H-18: Send webhook notification for supplement creation
  try {
    const { WebhookService } = await import("@/lib/webhook-service");
    await WebhookService.sendSupplementAdded(supplementId, claimId, ctx.orgId);
  } catch (webhookError) {
    console.warn("[SupplementCreate] Webhook delivery failed:", webhookError);
  }

  return NextResponse.json({ ok: true, supplementId }, { status: 201 });
}
