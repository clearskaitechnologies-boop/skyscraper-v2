import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { notifyClient } from "@/lib/notify";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = await notifyClient(body);
  return Response.json(result);
}
