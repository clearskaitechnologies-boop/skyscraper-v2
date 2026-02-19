import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import { collectRoutes } from "@/lib/diagnostics/routes";

export const runtime = "nodejs";

export async function GET() {
  // Admin-only: prevent unauthenticated route enumeration
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;

  const inventory = collectRoutes();
  return NextResponse.json({
    status: "ok",
    inventory,
  });
}
