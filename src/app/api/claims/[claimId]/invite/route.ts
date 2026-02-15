import crypto from "crypto";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { compose, withOrgScope, withRateLimit, withSentryApi } from "@/lib/api/wrappers";
import { canInviteClients } from "@/lib/auth/permissions";
import { createForbiddenResponse } from "@/lib/auth/rbac";
import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

/**
 * POST /api/claims/[claimId]/invite
 * Invite a client to access a claim via portal
 * Body: { email: string, contactId?: string, role: "VIEWER" | "EDITOR" }
 */
const basePOST = async (req: NextRequest, { params }: { params: { claimId: string } }) => {
  try {
    // Use centralized permissions check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await canInviteClients({ userId, claimId: params.claimId });
    if (!hasPermission) {
      return createForbiddenResponse("You don't have permission to invite clients to this claim", {
        requiredPermission: "claims:edit",
      });
    }

    const { orgId } = await getCurrentUserPermissions();

    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, contactId, role = "VIEWER" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!["VIEWER", "EDITOR"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Verify claim exists and belongs to org
    const claim = await prisma.claims.findFirst({
      where: { id: params.claimId, orgId: orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const id = crypto.randomUUID();

    // Create ClientAccess record - model only has id, claimId, email, createdAt
    const access = await prisma.client_access.create({
      data: {
        id,
        claimId: params.claimId,
        email,
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/portal/invite/${id}`;

    return NextResponse.json({
      success: true,
      access,
      inviteUrl,
      message: `Invitation sent to ${email}`,
    });
  } catch (error) {
    console.error("[POST /api/claims/[claimId]/invite] Error:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
};

const wrap = compose(withSentryApi, withRateLimit, withOrgScope);
export const POST = wrap(basePOST);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
