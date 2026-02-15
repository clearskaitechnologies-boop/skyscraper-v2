import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clients with essential information
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        phone: true,
        category: true,
        bio: true,
        avatarUrl: true,
        city: true,
        state: true,
        preferredContact: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      clients: clients.map((client) => ({
        ...client,
        createdAt: client.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching client directory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
