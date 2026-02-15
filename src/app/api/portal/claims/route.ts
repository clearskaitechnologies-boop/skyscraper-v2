import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/portal/claims
 * List all claims the current user has portal access to
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized", claims: [] }, { status: 401 });
    }

    // Get user email from Clerk
    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ ok: true, claims: [] });
    }

    // Find all claim accesses for this user's email
    let accesses: any[] = [];
    try {
      accesses = await prisma.client_access.findMany({
        where: {
          email: userEmail,
        },
        include: {
          claims: {
            select: {
              id: true,
              claimNumber: true,
              title: true,
              properties: {
                select: {
                  street: true,
                  city: true,
                  state: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (dbError) {
      console.error("[GET /api/portal/claims] DB Error:", dbError);
      // Return empty array instead of throwing
      return NextResponse.json({
        ok: true,
        claims: [],
        warning: "Could not load claims",
      });
    }

    // Format claims
    const claims = accesses
      .filter((access) => access.claims)
      .map((access) => ({
        id: access.claims.id,
        claimNumber: access.claims.claimNumber,
        title: access.claims.title,
        address: access.claims.properties
          ? `${access.claims.properties.street}, ${access.claims.properties.city}, ${access.claims.properties.state}`
          : null,
        role: "homeowner",
        accessGrantedAt: access.createdAt,
      }));

    return NextResponse.json({ ok: true, claims });
  } catch (error) {
    console.error("[GET /api/portal/claims] Fatal Error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error", claims: [] },
      { status: 500 }
    );
  }
}
