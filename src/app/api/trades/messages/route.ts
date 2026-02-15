import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
 * Resolve profile for messaging — tries tradesCompanyMember first (modern),
 * then falls back to tradesProfile (legacy) for backwards compatibility.
 */
async function resolveProfile(userId: string) {
  // Modern: tradesCompanyMember
  const member = await prisma.tradesCompanyMember
    .findUnique({
      where: { userId },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
    })
    .catch(() => null);

  if (member) {
    return {
      id: member.id,
      companyName: member.companyName,
      contactName: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
      logoUrl: member.avatar || null,
      email: member.email,
      source: "member" as const,
    };
  }

  // Legacy fallback: tradesProfile
  const legacy = await prisma.tradesProfile.findUnique({ where: { userId } }).catch(() => null);

  if (legacy) {
    return {
      id: legacy.id,
      companyName: legacy.companyName,
      contactName: legacy.contactName,
      logoUrl: legacy.logoUrl,
      email: legacy.email,
      source: "legacy" as const,
    };
  }

  return null;
}

// GET /api/trades/messages - Get user's messages
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await resolveProfile(userId);

  if (!profile) {
    // Return empty array instead of 404 — the messages page handles empty state
    return NextResponse.json([]);
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || "inbox";

  try {
    const messages =
      folder === "sent"
        ? await prisma.tradesMessage.findMany({
            where: { fromProfileId: profile.id },
            include: {
              TradesProfile_TradesMessage_toProfileIdToTradesProfile: {
                select: {
                  companyName: true,
                  contactName: true,
                  logoUrl: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : await prisma.tradesMessage.findMany({
            where: { toProfileId: profile.id, archived: false },
            include: {
              TradesProfile_TradesMessage_fromProfileIdToTradesProfile: {
                select: {
                  companyName: true,
                  contactName: true,
                  logoUrl: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[trades/messages GET] Error:", error);
    // Return empty on error rather than crashing the messages page
    return NextResponse.json([]);
  }
}

// POST /api/trades/messages - Send message
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await resolveProfile(userId);

  if (!profile) {
    return NextResponse.json(
      { error: "Profile not found — complete trades onboarding first" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const { toProfileId, subject, message } = body;

  if (!toProfileId || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const newMessage = await prisma.tradesMessage.create({
      data: {
        id: randomUUID(),
        fromProfileId: profile.id,
        toProfileId,
        subject,
        message,
      },
      include: {
        TradesProfile_TradesMessage_toProfileIdToTradesProfile: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("[trades/messages POST] Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
