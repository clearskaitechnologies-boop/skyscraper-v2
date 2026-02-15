export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

/**
 * Query: ?cursor=...&limit=20
 * Returns: { items: [...], nextCursor?: string }
 * NOTE: Back with DB reads using created_at/id cursor for pagination.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? "20");
  const items = []; // await db.query('select ... order by created_at desc limit $1', [limit+1])

  // const nextCursor = items.length > limit ? items.pop().id : undefined;
  const nextCursor = undefined;

  return NextResponse.json({ items, nextCursor });
}
