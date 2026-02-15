// TODO: This route queries legacy damage_reports table via raw SQL. Verify if still needed.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Math.min(Number(url.searchParams.get("pageSize") || 10), 50);
    const offset = (page - 1) * pageSize;

    const data = await prisma.$queryRaw<
      Array<{
        id: string;
        address: string;
        date_of_loss: string;
        roof_type: string;
        roof_sqft: number | null;
        pdf_path: string;
        created_at: string;
      }>
    >`
      SELECT id, address, date_of_loss, roof_type, roof_sqft, pdf_path, created_at
      FROM damage_reports
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::int as count FROM damage_reports WHERE user_id = ${userId}::uuid
    `;

    const count = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      data,
      page,
      pageSize,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    });
  } catch (error: any) {
    console.error("Failed to list reports:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to list reports" },
      { status: 500 }
    );
  }
}
