import { NextResponse } from "next/server";

import { withAuth } from "@/lib/auth/withAuth";
import { notifyClient } from "@/lib/notify";

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const result = await notifyClient(body);
  return NextResponse.json(result);
});
