/**
 * Team Member Profile API Route
 * Master Prompt #56: Professional Identity and Gamification Framework
 *
 * GET: Fetch member profile data
 * PATCH: Update profile fields
 */

import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { withSentryApi } from "@/lib/monitoring/sentryApi";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

export const GET = withSentryApi(
  async (req: Request, { params }: { params: { memberId: string } }) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const orgCtx = await getActiveOrgContext({ required: true });
      if (!orgCtx.ok) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      let member: Record<string, unknown> | null = null;
      try {
        member = await prisma.users.findFirst({
          where: {
            id: params.memberId,
            orgId: orgCtx.orgId,
          },
          select: {
            id: true,
            name: true,
            email: true,
            clerkUserId: true,
            headshot_url: true,
            role: true,
          },
        });
      } catch (e) {
        // If column missing in DB, retry without headshotUrl and log
        if (
          typeof e?.message === "string" &&
          (e.message.includes("headshot_url") || e.message.includes("public_skills"))
        ) {
          logger.warn("[GET team member] headshot_url column missing - retrying without select");
          member = await prisma.users.findFirst({
            where: { id: params.memberId, orgId: orgCtx.orgId },
            select: {
              id: true,
              name: true,
              email: true,
              clerkUserId: true,
              role: true,
            },
          });
        } else {
          throw e;
        }
      }

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }
      return NextResponse.json(member);
    } catch (error) {
      logger.error("GET /api/team/member/[memberId] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

export const PATCH = withSentryApi(
  async (req: Request, { params }: { params: { memberId: string } }) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const orgCtx = await getActiveOrgContext({ required: true });
      if (!orgCtx.ok) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      const body = await req.json();
      const { headshot_url, name } = body;

      // Verify member belongs to organization
      const member = await prisma.users.findFirst({
        where: {
          id: params.memberId,
          orgId: orgCtx.orgId,
        },
        select: { id: true, clerkUserId: true },
      });

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      const isSelf = member.clerkUserId === userId;
      const role = typeof orgCtx.role === "string" ? orgCtx.role.toLowerCase() : "";
      const isOrgAdmin = role === "owner" || role === "admin";
      if (!isSelf && !isOrgAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Update profile
      let updated: Record<string, unknown> | null = null;
      try {
        updated = await prisma.users.update({
          where: { id: params.memberId },
          data: {
            ...(headshot_url !== undefined && { headshot_url }),
            ...(name !== undefined && { name }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            headshot_url: true,
            role: true,
          },
        });
      } catch (e) {
        if (typeof e?.message === "string" && e.message.includes("headshot_url")) {
          logger.warn("[PATCH team member] headshot_url column missing - retrying without it");
          updated = await prisma.users.update({
            where: { id: params.memberId },
            data: {
              ...(name !== undefined && { name }),
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          });
        } else {
          throw e;
        }
      }
      return NextResponse.json({ success: true, member: updated });
    } catch (error) {
      logger.error("PATCH /api/team/member/[memberId] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

/**
 * PUT: Update member role
 */
export const PUT = withSentryApi(
  async (req: Request, { params }: { params: { memberId: string } }) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const orgCtx = await getActiveOrgContext({ required: true });
      if (!orgCtx.ok) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      // Only admins/owners can change roles
      const role = typeof orgCtx.role === "string" ? orgCtx.role.toLowerCase() : "";
      const isOrgAdmin = role === "owner" || role === "admin";
      if (!isOrgAdmin) {
        return NextResponse.json({ error: "Only admins can change member roles" }, { status: 403 });
      }

      const body = await req.json();
      const { role: newRole } = body;

      if (
        !newRole ||
        !["ADMIN", "USER", "MANAGER", "PM", "INSPECTOR", "BILLING", "VENDOR"].includes(
          newRole.toUpperCase()
        )
      ) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      // Verify member belongs to organization
      const member = await prisma.users.findFirst({
        where: {
          id: params.memberId,
          orgId: orgCtx.orgId,
        },
        select: { id: true, clerkUserId: true },
      });

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      // Prevent changing own role (safety check)
      if (member.clerkUserId === userId) {
        return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
      }

      // Update role
      const updated = await prisma.users.update({
        where: { id: params.memberId },
        data: { role: newRole.toUpperCase() },
        select: { id: true, role: true },
      });

      return NextResponse.json({ success: true, member: updated });
    } catch (error) {
      logger.error("PUT /api/team/member/[memberId] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);

/**
 * DELETE: Remove member from organization
 */
export const DELETE = withSentryApi(
  async (req: Request, { params }: { params: { memberId: string } }) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const orgCtx = await getActiveOrgContext({ required: true });
      if (!orgCtx.ok) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      // Only admins/owners can remove members
      const role = typeof orgCtx.role === "string" ? orgCtx.role.toLowerCase() : "";
      const isOrgAdmin = role === "owner" || role === "admin";
      if (!isOrgAdmin) {
        return NextResponse.json({ error: "Only admins can remove team members" }, { status: 403 });
      }

      // Verify member belongs to organization
      const member = await prisma.users.findFirst({
        where: {
          id: params.memberId,
          orgId: orgCtx.orgId,
        },
        select: { id: true, clerkUserId: true, email: true },
      });

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      // Prevent removing yourself
      if (member.clerkUserId === userId) {
        return NextResponse.json(
          { error: "Cannot remove yourself from the team" },
          { status: 400 }
        );
      }

      // Delete the user from the organization
      await prisma.users.delete({
        where: { id: params.memberId },
      });

      return NextResponse.json({
        success: true,
        message: `Member ${member.email} removed from team`,
      });
    } catch (error) {
      logger.error("DELETE /api/team/member/[memberId] error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
);
