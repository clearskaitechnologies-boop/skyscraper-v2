/**
 * Prisma health check endpoint
 * Verifies prisma is initialized and can query database
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// 🔥 FORCE NODE RUNTIME - PRISMA CANNOT RUN ON EDGE
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Test actual database query
    const orgCount = await prisma.org.count();

    return NextResponse.json({
      ok: true,
      databaseUrlSet: !!process.env.DATABASE_URL,
      prismaType: typeof prisma,
      prismaKeys: Object.keys(prisma).slice(0, 20),
      queryResult: { organizationCount: orgCount },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        prismaType: typeof prisma,
        databaseUrlSet: !!process.env.DATABASE_URL,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const prismaObj = prisma as unknown as Record<string, unknown>;
  const orgDelegate = prismaObj.org as Record<string, unknown> | undefined;
  const hasOrgDelegate = !!prisma && typeof orgDelegate?.findMany === "function";

  return NextResponse.json({
    ok: true,
    prismaType: typeof prisma,
    hasOrgDelegate,
    hasOrganizationKey: prisma ? "org" in prismaObj : false,
    hasUserKey: prisma ? "users" in prismaObj : false,
    hasUserOrganizationsKey: prisma ? "user_organizations" in prismaObj : false,
    keys: prisma ? Object.keys(prismaObj).slice(0, 60) : null,
  });
}
