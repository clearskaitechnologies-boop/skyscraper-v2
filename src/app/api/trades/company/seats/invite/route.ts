/**
 * Company Invite API
 * POST /api/trades/company/seats/invite - Invite a new team member
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { ensureUserOrgContext } from "@/lib/auth/ensureUserOrgContext";
import { sendTeamInviteEmail } from "@/lib/mailer";
import prisma from "@/lib/prisma";
import { isPlatformAdmin } from "@/lib/security/roles";

export const dynamic = "force-dynamic";

// Base seat limits by plan
// Solo: $29.99/mo - 1 seat (can add up to 2 at $9.99/seat)
// Business: $139.99/mo - 10 seats
// Enterprise: $399.99/mo - 25 seats
const SEAT_LIMITS: Record<string, number> = {
  free: 1,
  solo: 3, // Solo base is 1 but users buy addon seats — give full 3 to avoid blocking
  solo_plus: 3, // Solo + 2 addon seats at $9.99 each
  business: 10,
  enterprise: 25,
  // Legacy plan mappings
  starter: 3,
  pro: 10,
  pro_plus: 10,
  team: 10,
  unlimited: 25,
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, firstName, lastName, role = "member", title } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get inviter's trade profile
    // Include ALL members (active + pending) for accurate seat counting
    const inviter = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: {
        company: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!inviter) {
      return NextResponse.json(
        { error: "You must have a trade profile to invite members" },
        { status: 400 }
      );
    }

    // Check if user can manage seats
    if (!inviter.isOwner && !inviter.isAdmin) {
      return NextResponse.json(
        { error: "Only owners and admins can invite team members" },
        { status: 403 }
      );
    }

    // Get org subscription info
    const { orgId } = await ensureUserOrgContext(userId);
    const org = await prisma.org.findUnique({
      where: { id: orgId },
      select: { planKey: true },
    });

    const planKey = org?.planKey || "solo";
    let seatLimit = SEAT_LIMITS[planKey] || 3; // Default to 3 (solo w/ addons)
    // Only count active + pending members for seat usage (not revoked)
    const usedSeats =
      inviter.company?.members?.filter(
        (m: { status?: string | null }) => m.status === "active" || m.status === "pending"
      ).length || 1;

    // Platform admin override — always get at least 10 seats
    const isAdmin = await isPlatformAdmin();
    if (isAdmin) {
      seatLimit = Math.max(seatLimit, 10);
    }

    // Check if email already exists (before seat check — re-invites shouldn't use new seat)
    const existingMember = await prisma.tradesCompanyMember.findFirst({
      where: { email: email.toLowerCase() },
    });

    // For re-invites to someone already in THIS company, skip seat check
    const isReinvite = existingMember && existingMember.companyId === inviter.companyId;

    // Check seat availability (skip for re-invites — they already occupy a seat)
    if (!isReinvite && usedSeats >= seatLimit) {
      return NextResponse.json(
        {
          error: "No seats available",
          requiresUpgrade: true,
          currentPlan: planKey,
          seatLimit,
          usedSeats,
        },
        { status: 402 }
      ); // Payment Required
    }

    if (existingMember) {
      // If they're already ACTIVE in a DIFFERENT company, block
      if (
        existingMember.companyId &&
        existingMember.companyId !== inviter.companyId &&
        existingMember.status === "active"
      ) {
        return NextResponse.json(
          { error: "This user is already an active member of another company" },
          { status: 409 }
        );
      }

      // If they're in THIS company (pending re-invite) or have no company, update them
      const updated = await prisma.tradesCompanyMember.update({
        where: { id: existingMember.id },
        data: {
          companyId: inviter.companyId,
          role,
          title,
          status: "pending",
          pendingCompanyToken: generateInviteToken(),
        },
      });

      // Send invite email
      let emailSent = false;
      let emailError: any = null;
      try {
        const result = await sendTeamInviteEmail({
          to: updated.email!,
          inviterName:
            `${inviter.firstName || ""} ${inviter.lastName || ""}`.trim() || "A team member",
          companyName: inviter.company?.name || "Your Company",
          inviteeName: existingMember.firstName || undefined,
          role: role || "member",
          inviteToken: updated.pendingCompanyToken!,
        });
        emailSent = !!result?.data?.id;
        if (result?.error) {
          emailError = result.error;
          console.error("[company/seats/invite] Resend API error:", result.error);
        }
      } catch (err) {
        emailError = err;
        console.error("[company/seats/invite] Email send failed:", err);
      }

      return NextResponse.json({
        success: true,
        emailSent,
        emailError: emailError
          ? String(emailError?.message || emailError?.name || emailError)
          : null,
        message: emailSent
          ? "Invitation sent — email delivered"
          : "Invitation created but email delivery failed. Share the invite link manually.",
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/trades/join?token=${updated.pendingCompanyToken}`,
        invite: {
          id: updated.id,
          email: updated.email,
          status: "pending",
        },
      });
    }

    // Create new pending member
    // Invitees automatically inherit the admin's company and name
    const newMember = await prisma.tradesCompanyMember.create({
      data: {
        userId: `pending_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`, // Temp userId
        companyId: inviter.companyId,
        companyName: inviter.company?.name || inviter.companyName, // Inherit company name
        email: email.toLowerCase(),
        firstName,
        lastName,
        role,
        title,
        status: "pending",
        isActive: false, // Not active until they accept AND complete profile
        isAdmin: false, // Invitees do NOT get admin privileges
        isOwner: false, // Invitees are NOT owners
        canEditCompany: false, // Invitees CANNOT edit company page
        onboardingStep: "profile", // They'll need to complete profile after accepting
        pendingCompanyToken: generateInviteToken(),
      },
    });

    // Send invite email with token
    let emailSent = false;
    let emailErr: any = null;
    try {
      const result = await sendTeamInviteEmail({
        to: newMember.email!,
        inviterName:
          `${inviter.firstName || ""} ${inviter.lastName || ""}`.trim() || "A team member",
        companyName: inviter.company?.name || "Your Company",
        inviteeName: firstName || undefined,
        role: role || "member",
        inviteToken: newMember.pendingCompanyToken!,
      });
      emailSent = !!result?.data?.id;
      if (result?.error) {
        emailErr = result.error;
        console.error("[company/seats/invite] Resend API error:", result.error);
      }
    } catch (err) {
      emailErr = err;
      console.error("[company/seats/invite] Email send failed:", err);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailError: emailErr ? String(emailErr?.message || emailErr?.name || emailErr) : null,
      message: emailSent
        ? "Invitation sent — email delivered"
        : "Invitation created but email delivery failed. Share the invite link manually.",
      inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/trades/join?token=${newMember.pendingCompanyToken}`,
      invite: {
        id: newMember.id,
        email: newMember.email,
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        status: "pending",
      },
      seatsRemaining: seatLimit - usedSeats - 1,
    });
  } catch (error: any) {
    console.error("[company/seats/invite] Error:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({ error: "This email has already been invited" }, { status: 409 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/trades/company/seats/invite?id=xxx - Revoke a pending invite
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("id");

    if (!inviteId) {
      return NextResponse.json({ error: "Invite ID required" }, { status: 400 });
    }

    // Get revoker's trade profile
    const revoker = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
    });

    if (!revoker) {
      return NextResponse.json({ error: "Trade profile not found" }, { status: 404 });
    }

    if (!revoker.isOwner && !revoker.isAdmin) {
      return NextResponse.json({ error: "Only admins can revoke invites" }, { status: 403 });
    }

    // Find the member / invite
    const invite = await prisma.tradesCompanyMember.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.companyId !== revoker.companyId) {
      return NextResponse.json({ error: "Member not found in your company" }, { status: 404 });
    }

    // Can't remove yourself (the owner)
    if (invite.userId === revoker.userId) {
      return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
    }

    // If it's a placeholder user (userId starts with "pending_"), delete entirely
    if (invite.userId.startsWith("pending_")) {
      await prisma.tradesCompanyMember.delete({ where: { id: inviteId } });
    } else {
      // Real user — unlink from company and deactivate
      await prisma.tradesCompanyMember.update({
        where: { id: inviteId },
        data: {
          companyId: null,
          status: "inactive",
          isActive: false,
          pendingCompanyToken: null,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: invite.status === "pending" ? "Invite revoked" : "Member removed",
    });
  } catch (error) {
    console.error("[company/seats/invite] DELETE Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateInviteToken(): string {
  return `inv_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
