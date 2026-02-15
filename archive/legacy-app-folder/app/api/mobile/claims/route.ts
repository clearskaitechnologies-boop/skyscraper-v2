// ============================================================================
// H-17: Mobile API - Claims List
// ============================================================================

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "skaiscrape-mobile-secret");

async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; orgId: string };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyMobileToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");

    const claims = await db.claim.findMany({
      where: {
        orgId: payload.orgId,
        ...(status && { status }),
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        lossDate: true,
        createdAt: true,
        properties: {
          select: {
            street: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
      },
    });

    const total = await db.claim.count({
      where: {
        orgId: payload.orgId,
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      claims: claims.map((c) => ({
        id: c.id,
        status: c.status,
        address: `${c.properties?.street}, ${c.properties?.city}, ${c.properties?.state}`,
        lossDate: c.lossDate,
        createdAt: c.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("[MOBILE_CLAIMS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}
