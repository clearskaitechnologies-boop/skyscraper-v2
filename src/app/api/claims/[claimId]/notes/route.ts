// src/app/api/claims/[id]/notes/route.ts
// API endpoint for creating and managing notes (using activities model)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireApiAuth, verifyClaimAccess } from "@/lib/auth/apiAuth";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";

const createNoteSchema = z.object({
  body: z.string().min(1, "Note body is required"),
  noteType: z.enum(["internal", "general"]).optional().default("general"),
  isPinned: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const claimId = params.id;

  try {
    const authResult = await requireApiAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, orgId } = authResult;

    // Verify claim access
    const accessResult = await verifyClaimAccess(claimId, orgId, userId);
    if (accessResult instanceof NextResponse) return accessResult;

    const body = await req.json();

    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { body: noteBody, noteType, isPinned } = parsed.data;

    // Get user details
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Store note as an activity
    const note = await prisma.activities.create({
      data: {
        id: crypto.randomUUID(),
        orgId: orgId ?? undefined,
        claimId,
        type: noteType === "internal" ? "internal_note" : "note",
        title: "Note Added",
        description: noteBody,
        userId,
        userName: user?.name || "Unknown",
        metadata: { isPinned: isPinned || false },
        updatedAt: new Date(),
      } as any,
    });

    console.log("[NOTE_CREATE] Success:", {
      claimId,
      noteId: note.id,
      type: noteType,
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error: any) {
    console.error("[NOTE_CREATE_ERROR]", {
      claimId,
      error: error.message,
    });

    return new NextResponse("Failed to create note", { status: 500 });
  }
}

// GET endpoint to fetch notes for a claim
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const claimId = params.id;

  try {
    const orgCtx = await safeOrgContext();

    if (!orgCtx?.orgId) {
      return new NextResponse("No org context", { status: 403 });
    }

    // Verify claim belongs to user's org
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId: orgCtx.orgId,
      },
      select: { id: true },
    });

    if (!claim) {
      return new NextResponse("Claim not found or access denied", { status: 404 });
    }

    // Get notes (stored as activities with type 'note' or 'internal_note')
    const notes = await prisma.activities.findMany({
      where: {
        claimId,
        type: { in: ["note", "internal_note"] },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    console.error("[NOTES_GET_ERROR]", {
      claimId,
      error: error.message,
    });

    return new NextResponse("Failed to fetch notes", { status: 500 });
  }
}
