// ORG-SCOPE: Scoped by companyId (derived from authenticated user's membership) — no cross-tenant risk
// GET lists pending join requests for the admin's own company only.
// POST creates a join request scoped to a specific companyId.
// PATCH approves/rejects requests within the admin's own company.

/**
 * Join Request API
 * GET  /api/trades/company/join-requests — List pending join requests (admin only)
 * POST /api/trades/company/join-requests — Submit a request to join a company
 * PATCH /api/trades/company/join-requests — Approve or reject a join request (admin only)
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ─── GET: List pending join requests (admin only) ──────────────────────
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get requesting user's membership
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!member?.companyId) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    // Only admins can view join requests
    const isAdminUser =
      member.role === "admin" || member.role === "owner" || member.isOwner || member.isAdmin;

    if (!isAdminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Find all pending join requests for this company
    const requests = await prisma.tradesCompanyMember.findMany({
      where: {
        companyId: member.companyId,
        status: "pending_join",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        jobTitle: true,
        tradeType: true,
        status: true,
        createdAt: true,
        avatar: true,
        bio: true,
        yearsExperience: true,
        skills: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    console.error("[join-requests] GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST: Submit a request to join a company ──────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, jobTitle } = body;

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Check that the company exists
    const company = await prisma.tradesCompany.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, isActive: true },
    });

    if (!company || !company.isActive) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get the requesting user's member profile
    const member = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You must have a Trades profile to request to join a company" },
        { status: 400 }
      );
    }

    // If they already belong to a company
    if (member.companyId && member.status === "active") {
      return NextResponse.json(
        { error: "You are already part of a company. Leave your current company first." },
        { status: 409 }
      );
    }

    // Check if they already have a pending request for this company
    if (member.companyId === companyId && member.status === "pending_join") {
      return NextResponse.json(
        { error: "You already have a pending request for this company" },
        { status: 409 }
      );
    }

    // Update member with pending join request
    const updated = await prisma.tradesCompanyMember.update({
      where: { id: member.id },
      data: {
        companyId,
        jobTitle: jobTitle || member.jobTitle,
        status: "pending_join",
        role: "member",
        isAdmin: false,
        canEditCompany: false,
        isActive: false, // Not active until approved
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Your request to join ${company.name} has been sent!`,
      request: {
        id: updated.id,
        companyId: updated.companyId,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("[join-requests] POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH: Approve or reject a join request (admin only) ──────────────
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestId, action } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: "requestId and action are required" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }

    // Get admin's membership
    const adminMember = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!adminMember?.companyId) {
      return NextResponse.json({ error: "No company found" }, { status: 404 });
    }

    const isAdminUser =
      adminMember.role === "admin" ||
      adminMember.role === "owner" ||
      adminMember.isOwner ||
      adminMember.isAdmin;

    if (!isAdminUser) {
      return NextResponse.json({ error: "Only admins can manage join requests" }, { status: 403 });
    }

    // Find the join request
    const joinRequest = await prisma.tradesCompanyMember.findUnique({
      where: { id: requestId },
    });

    if (!joinRequest) {
      return NextResponse.json({ error: "Join request not found" }, { status: 404 });
    }

    if (joinRequest.companyId !== adminMember.companyId) {
      return NextResponse.json({ error: "This request is not for your company" }, { status: 403 });
    }

    if (joinRequest.status !== "pending_join") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 409 }
      );
    }

    if (action === "approve") {
      // Approve: activate the member
      await prisma.tradesCompanyMember.update({
        where: { id: requestId },
        data: {
          status: "active",
          role: "member",
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${joinRequest.firstName || "Member"} has been added to your team!`,
        action: "approved",
      });
    } else {
      // Reject: remove company link
      await prisma.tradesCompanyMember.update({
        where: { id: requestId },
        data: {
          companyId: null,
          status: "rejected",
          isActive: true, // They're still an active trades member, just not in this company
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Join request declined",
        action: "rejected",
      });
    }
  } catch (error) {
    console.error("[join-requests] PATCH Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
