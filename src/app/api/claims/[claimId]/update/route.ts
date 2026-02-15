// src/app/api/claims/[claimId]/update/route.ts
import { NextRequest, NextResponse } from "next/server";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ claimId: string }> }
) {
  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;
    const { claimId } = await params;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    const body = await request.json();
    const {
      title,
      description,
      status,
      damageType,
      insured_name,
      homeowner_email,
      carrier,
      policy_number,
      dateOfLoss,
      dateOfInspection,
      propertyAddress,
      adjusterName,
      adjusterPhone,
      adjusterEmail,
    } = body;

    // Verify claim belongs to org
    const existingClaim = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    if (!existingClaim || existingClaim.orgId !== orgId) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (damageType !== undefined) updateData.damageType = damageType;
    if (insured_name !== undefined) updateData.insured_name = insured_name;
    if (homeowner_email !== undefined) updateData.homeowner_email = homeowner_email;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (policy_number !== undefined) updateData.policy_number = policy_number;
    if (dateOfLoss !== undefined) updateData.dateOfLoss = dateOfLoss ? new Date(dateOfLoss) : null;
    if (dateOfInspection !== undefined)
      updateData.dateOfInspection = dateOfInspection ? new Date(dateOfInspection) : null;
    if (adjusterName !== undefined) updateData.adjusterName = adjusterName;
    if (adjusterPhone !== undefined) updateData.adjusterPhone = adjusterPhone;
    if (adjusterEmail !== undefined) updateData.adjusterEmail = adjusterEmail;

    // Update claim
    const updatedClaim = await prisma.claims.update({
      where: { id: claimId },
      data: updateData,
    });

    // If property address is provided, update the property (properties uses 'street' not 'address')
    if (propertyAddress !== undefined && updatedClaim.propertyId) {
      await prisma.properties.update({
        where: { id: updatedClaim.propertyId },
        data: { street: propertyAddress },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Claim updated successfully",
      data: updatedClaim,
    });
  } catch (error: any) {
    console.error("[PATCH /api/claims/[claimId]/update] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update claim" },
      { status: 500 }
    );
  }
}
