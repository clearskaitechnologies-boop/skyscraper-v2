/**
 * Trades Groups Membership API
 * Handles joining, leaving, and managing group members
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// POST - Join a group
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Check group exists and is active
    const group = await prisma.tradesGroup.findUnique({
      where: { id: groupId, isActive: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing) {
      if (existing.status === "banned") {
        return NextResponse.json(
          { error: "You have been banned from this group" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Already a member", membership: existing },
        { status: 409 }
      );
    }

    // For private groups, could add pending status - for now, auto-approve
    const membership = await prisma.tradesGroupMember.create({
      data: {
        groupId,
        userId,
        role: "member",
        status: "active",
      },
    });

    // Increment member count
    await prisma.tradesGroup.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trades/groups/members error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}

// DELETE - Leave a group
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Check membership
    const membership = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this group" }, { status: 404 });
    }

    // Don't allow sole admin to leave
    if (membership.role === "admin") {
      const adminCount = await prisma.tradesGroupMember.count({
        where: { groupId, role: "admin", status: "active" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot leave group as the only admin. Transfer ownership first." },
          { status: 400 }
        );
      }
    }

    // Delete membership
    await prisma.tradesGroupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });

    // Decrement member count
    await prisma.tradesGroup.update({
      where: { id: groupId },
      data: { memberCount: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades/groups/members error:", error);
    return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
  }
}

// PATCH - Update member role (admin action)
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, targetUserId, role, status } = body;

    if (!groupId || !targetUserId) {
      return NextResponse.json(
        { error: "Group ID and target user ID are required" },
        { status: 400 }
      );
    }

    // Check if requester is admin
    const requesterMembership = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!requesterMembership || !["admin", "moderator"].includes(requesterMembership.role)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Can't modify yourself with this endpoint
    if (targetUserId === userId) {
      return NextResponse.json({ error: "Cannot modify your own membership" }, { status: 400 });
    }

    // Check target membership exists
    const targetMembership = await prisma.tradesGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Target user is not a member" }, { status: 404 });
    }

    // Only admins can change roles
    if (role && requesterMembership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can change roles" }, { status: 403 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const updated = await prisma.tradesGroupMember.update({
      where: { groupId_userId: { groupId, userId: targetUserId } },
      data: updateData,
    });

    return NextResponse.json({ membership: updated });
  } catch (error) {
    console.error("PATCH /api/trades/groups/members error:", error);
    return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
  }
}
