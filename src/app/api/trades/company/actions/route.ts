/**
 * Trades Company Actions - Unified handler for company management
 *
 * POST /api/trades/company/actions
 * Actions: update_cover, add_employee, remove_employee, handle_join_request,
 *          invite_seat, accept_seat
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_cover"),
    coverUrl: z.string().url(),
  }),
  z.object({
    action: z.literal("add_employee"),
    email: z.string().email(),
    role: z.string().optional(),
  }),
  z.object({
    action: z.literal("remove_employee"),
    employeeId: z.string(),
  }),
  z.object({
    action: z.literal("handle_join_request"),
    requestId: z.string(),
    approve: z.boolean(),
    message: z.string().optional(),
  }),
  z.object({
    action: z.literal("invite_seat"),
    email: z.string().email(),
    role: z.string().optional(),
  }),
  z.object({
    action: z.literal("accept_seat"),
    inviteId: z.string(),
  }),
  z.object({
    action: z.literal("update_info"),
    name: z.string().optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().optional(),
    address: z.record(z.any()).optional(),
  }),
]);

type ActionInput = z.infer<typeof ActionSchema>;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;

    // Get user's company
    const membership = await prisma.tradesCompanyMember.findFirst({
      where: { userId, role: { in: ["owner", "admin"] } },
      include: { company: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "Company admin access required" }, { status: 403 });
    }

    const companyId = membership.companyId;

    switch (input.action) {
      case "update_cover":
        return handleUpdateCover(companyId, input);

      case "add_employee":
        return handleAddEmployee(companyId, input);

      case "remove_employee":
        return handleRemoveEmployee(companyId, input);

      case "handle_join_request":
        return handleJoinRequest(companyId, input);

      case "invite_seat":
        return handleInviteSeat(companyId, userId, input);

      case "accept_seat":
        return handleAcceptSeat(userId, input);

      case "update_info":
        return handleUpdateInfo(companyId, input);

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Trades Company Actions] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function handleUpdateCover(
  companyId: string,
  input: Extract<ActionInput, { action: "update_cover" }>
) {
  await prisma.tradesCompany.update({
    where: { id: companyId },
    data: { coverPhotoUrl: input.coverUrl },
  });

  return NextResponse.json({ success: true });
}

async function handleAddEmployee(
  companyId: string,
  input: Extract<ActionInput, { action: "add_employee" }>
) {
  const employee = await prisma.tradesCompanyEmployee.create({
    data: {
      companyId,
      email: input.email,
      role: input.role || "member",
      status: "invited",
    },
  });

  return NextResponse.json({ success: true, employee });
}

async function handleRemoveEmployee(
  companyId: string,
  input: Extract<ActionInput, { action: "remove_employee" }>
) {
  await prisma.tradesCompanyEmployee.delete({
    where: {
      id: input.employeeId,
      companyId,
    },
  });

  return NextResponse.json({ success: true });
}

async function handleJoinRequest(
  companyId: string,
  input: Extract<ActionInput, { action: "handle_join_request" }>
) {
  if (input.approve) {
    await prisma.tradesJoinRequest.update({
      where: { id: input.requestId },
      data: { status: "approved", approvedAt: new Date() },
    });

    // Add as member
    const request = await prisma.tradesJoinRequest.findUnique({
      where: { id: input.requestId },
    });

    if (request) {
      await prisma.tradesCompanyMember.create({
        data: {
          companyId,
          userId: request.userId,
          role: "member",
        },
      });
    }
  } else {
    await prisma.tradesJoinRequest.update({
      where: { id: input.requestId },
      data: { status: "rejected", rejectionMessage: input.message },
    });
  }

  return NextResponse.json({ success: true });
}

async function handleInviteSeat(
  companyId: string,
  invitedBy: string,
  input: Extract<ActionInput, { action: "invite_seat" }>
) {
  const invite = await prisma.tradesSeatInvite.create({
    data: {
      companyId,
      email: input.email,
      role: input.role || "member",
      invitedBy,
      status: "pending",
    },
  });

  return NextResponse.json({ success: true, invite });
}

async function handleAcceptSeat(
  userId: string,
  input: Extract<ActionInput, { action: "accept_seat" }>
) {
  const invite = await prisma.tradesSeatInvite.findUnique({
    where: { id: input.inviteId },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Accept invite
  await prisma.tradesSeatInvite.update({
    where: { id: input.inviteId },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  // Add user to company
  await prisma.tradesCompanyMember.create({
    data: {
      companyId: invite.companyId,
      userId,
      role: invite.role || "member",
    },
  });

  return NextResponse.json({ success: true });
}

async function handleUpdateInfo(
  companyId: string,
  input: Extract<ActionInput, { action: "update_info" }>
) {
  const { action, ...updateData } = input;

  await prisma.tradesCompany.update({
    where: { id: companyId },
    data: updateData,
  });

  return NextResponse.json({ success: true });
}
