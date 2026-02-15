import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const info =
      await prisma.$queryRaw`select current_database() as db, current_schema() as schema`;

    const orgColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'organizations'
      ORDER BY ordinal_position
    `;

    const userOrgColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_organizations'
      ORDER BY ordinal_position
    `;

    return NextResponse.json({ info, orgColumns, userOrgColumns });
  } catch (err: any) {
    console.error("DEBUG-DB ERROR", err);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
