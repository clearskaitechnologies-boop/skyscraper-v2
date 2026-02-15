import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import prisma from "@/lib/prisma";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, claimId, documentId, shared } = body;

    if (!clientId || !claimId || !documentId) {
      return NextResponse.json(
        {
          error: "Client ID, Claim ID, and Document ID are required",
        },
        { status: 400 }
      );
    }

    // Get the client-claim link
    const clientLink = await prisma.claimClientLink.findUnique({
      where: { claimId_clientEmail: { claimId, clientEmail: clientId } },
    });

    if (!clientLink) {
      return NextResponse.json({ error: "Client link not found" }, { status: 404 });
    }

    // Update shared document IDs
    const currentShared = clientLink.sharedDocumentIds || [];
    let updatedShared: string[];

    if (shared) {
      // Add document if not already shared
      updatedShared = currentShared.includes(documentId)
        ? currentShared
        : [...currentShared, documentId];
    } else {
      // Remove document from shared list
      updatedShared = currentShared.filter((id: string) => id !== documentId);
    }

    await prisma.claimClientLink.update({
      where: { id: clientLink.id },
      data: { sharedDocumentIds: updatedShared },
    });

    return NextResponse.json({
      success: true,
      shared,
      sharedDocumentIds: updatedShared,
      message: `Document ${shared ? "shared with" : "unshared from"} client`,
    });
  } catch (error) {
    console.error("Error toggling document sharing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("claimId");
    const clientId = searchParams.get("clientId");

    if (!claimId) {
      return NextResponse.json(
        {
          error: "Claim ID is required",
        },
        { status: 400 }
      );
    }

    // Mock shared documents data
    const mockSharedDocuments = [
      {
        id: "doc1",
        name: "Initial Assessment Report.pdf",
        type: "report",
        size: "2.4 MB",
        shared: true,
        sharedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "doc2",
        name: "Damage Photo 1.jpg",
        type: "photo",
        size: "1.8 MB",
        shared: true,
        sharedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "doc3",
        name: "Insurance Estimate.pdf",
        type: "estimate",
        size: "890 KB",
        shared: false,
        sharedAt: null,
      },
      {
        id: "doc4",
        name: "Repair Progress Photo.jpg",
        type: "photo",
        size: "2.1 MB",
        shared: true,
        sharedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({
      documents: mockSharedDocuments,
    });
  } catch (error) {
    console.error("Error fetching shared documents:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
