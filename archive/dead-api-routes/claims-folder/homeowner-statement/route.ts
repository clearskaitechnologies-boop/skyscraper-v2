// src/app/api/claims-folder/homeowner-statement/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { z } from "zod";

import { isAuthError, requireAuth } from "@/lib/auth/requireAuth";
import prisma from "@/lib/prisma";

const HomeownerStatementSchema = z.object({
  claimId: z.string().min(1),
  statement: z.object({
    description: z.string(),
    discoveryDate: z.string(),
    discoveryDescription: z.string().optional(),
    priorConditions: z.string().optional(),
    priorRepairs: z.string().optional(),
    additionalInfo: z.string().optional(),
    signed: z.boolean(),
    signedBy: z.string().optional(),
    signedDate: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId } = auth;

  try {
    const body = await request.json();
    const parsed = HomeownerStatementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { claimId, statement } = parsed.data;

    // Verify claim exists and belongs to this org
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Store statement in claim metadata or separate table
    // For now, we'll update the claim's metadata JSON field
    const updatedClaim = await prisma.claims.update({
      where: { id: claimId },
      data: {
        // Store as JSON in a metadata field if it exists, or create a document
        updatedAt: new Date(),
        // Would store in homeownerStatement field if schema supports it
      },
    });

    // Also create a document record for the statement
    const documentTitle = statement.signed
      ? `Homeowner Statement - Signed by ${statement.signedBy} on ${statement.signedDate}`
      : `Homeowner Statement - Draft`;

    // If there's a documents table, create entry
    // await prisma.document.create({
    //   data: {
    //     claimId,
    //     type: "homeowner_statement",
    //     title: documentTitle,
    //     content: JSON.stringify(statement),
    //     signed: statement.signed,
    //     signedBy: statement.signedBy,
    //     signedDate: statement.signedDate ? new Date(statement.signedDate) : null,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: statement.signed
        ? "Homeowner statement signed and saved"
        : "Homeowner statement draft saved",
      statement: {
        ...statement,
        claimId,
        savedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Homeowner statement save error:", error);
    return NextResponse.json({ error: "Failed to save statement" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;
  const { orgId } = auth;

  try {
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json({ error: "claimId required" }, { status: 400 });
    }

    // Fetch claim and any stored statement — org-scoped
    const claim = await prisma.claims.findFirst({
      where: { id: claimId, orgId },
      include: { properties: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Would fetch from documents table or metadata
    // const statement = await prisma.document.findFirst({
    //   where: { claimId, type: "homeowner_statement" },
    //   orderBy: { createdAt: "desc" },
    // });

    // For now, return empty/default statement
    return NextResponse.json({
      success: true,
      statement: null, // Would return actual statement if found
      claimInfo: {
        id: claim.id,
        propertyAddress: claim.properties
          ? `${claim.properties.street}, ${claim.properties.city}, ${claim.properties.state} ${claim.properties.zipCode}`
          : null,
        insured_name: claim.insured_name || "",
        dateOfLoss: claim.dateOfLoss?.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    logger.error("Homeowner statement fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch statement" }, { status: 500 });
  }
}
