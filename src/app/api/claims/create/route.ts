import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

const CreateClaimSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1).max(500),
  damageType: z.string().min(1).max(100),
  dateOfLoss: z.string().min(1),
  propertyId: z.string().min(1),
  description: z.string().max(5000).nullish(),
  claimNumber: z.string().max(100).nullish(),
});

export async function POST(req: Request) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;

    const body = await req.json();
    const parsed = CreateClaimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 422 }
      );
    }
    const { clientId, title, damageType, dateOfLoss, propertyId, description, claimNumber } =
      parsed.data;

    // Verify property belongs to org
    const property = await prisma.properties.findFirst({
      where: { id: propertyId, orgId: orgId ?? undefined },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found for org" }, { status: 404 });
    }

    const claim = await prisma.claims.create({
      data: {
        orgId: orgId ?? undefined,
        clientId,
        propertyId,
        title,
        description: description ?? null,
        damageType,
        dateOfLoss: new Date(dateOfLoss),
        claimNumber: claimNumber ?? `CL-${Date.now()}`,
      } as any,
    });

    return NextResponse.json({ ok: true, claim });
  } catch (e: any) {
    console.error("[claims:create]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to create claim",
        details: process.env.NODE_ENV === "development" ? e.message : undefined,
      },
      { status: 500 }
    );
  }
}
