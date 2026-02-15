// src/app/api/contacts/search/route.ts
import { NextResponse } from "next/server";

import { withOrgScope } from "@/lib/auth/tenant";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/contacts/search?q=query - Search contacts by name, email, or phone
 */
export const GET = withOrgScope(async (req, { orgId }) => {
  try {
    const searchParams = new URL(req.url).searchParams;
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({ contacts: [] });
    }

    const contacts = await prisma.contacts.findMany({
      where: {
        orgId: orgId,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
      take: 10,
    });

    return NextResponse.json({
      contacts: contacts.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
      })),
    });
  } catch (error: any) {
    console.error("[GET /api/contacts/search] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search contacts" },
      { status: 500 }
    );
  }
});
